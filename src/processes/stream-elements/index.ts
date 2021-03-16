import fs from "fs";
import mongoose from "mongoose";
import { nanoid } from "nanoid";

import User from "../../models/User";
import logger from "../../services/logger";
import {
  TextAlignments,
  TextPositions,
  Variation,
} from "../../types/streamElements";
import { normalizeHerotag } from "../../utils/transactions";
import { generateCss } from "./code-generators/css";
import {
  generatePreviewHtml,
  generateSnippetHtml,
} from "./code-generators/html";
import {
  formatVariationName,
  generateJavascript,
} from "./code-generators/javascript";

const payloadToVariation = (payload: Variation) => {
  return {
    name: payload.name,
    duration: payload.duration || 10,
    chances: payload.chances || 100,
    requiredAmount: payload.requiredAmount || 0,
    backgroundColor: payload.backgroundColor,
    width: payload.width,
    heigth: payload.heigth,
    position: payload.position,
    sound: {
      soundPath: payload?.sound?.soundPath,
      soundDelay: payload?.sound?.soundDelay,
      soundOffset: payload?.sound?.soundOffset,
    },
    image: {
      imagePath: payload?.image?.imagePath,
      width: payload?.image?.width,
      height: payload?.image?.height,
      animation: {
        enter: {
          type: payload?.image?.animation?.enter?.type,
          duration: payload?.image?.animation?.enter?.duration,
          delay: payload?.image?.animation?.enter?.delay,
        },
        exit: {
          type: payload?.image?.animation?.exit?.type,
          duration: payload?.image?.animation?.exit?.duration,
          offset: payload?.image?.animation?.exit?.offset,
        },
      },
    },
    text: {
      position: payload?.text?.position || TextPositions.top,
      content:
        payload?.text?.content || "You can display whatever you want here",
      width: payload?.text?.width || 300,
      height: payload?.text?.height,
      size: payload?.text?.size || "16",
      color: payload?.text?.color || "#2a2a2a",
      lineHeight: payload?.text?.lineHeight || "20",
      letterSpacing: payload?.text?.letterSpacing,
      wordSpacing: payload?.text?.wordSpacing,
      textAlign: payload?.text?.textAlign || TextAlignments.left,
      stroke: {
        width: payload.text?.stroke?.width,
        color: payload.text?.stroke?.color,
      },
      textStyle: payload?.text?.textStyle,
      animation: {
        enter: {
          type: payload?.text?.animation?.enter?.type,
          duration: payload?.text?.animation?.enter?.duration,
          delay: payload?.text?.animation?.enter?.delay,
        },
        exit: {
          type: payload?.text?.animation?.exit?.type,
          duration: payload?.text?.animation?.exit?.duration,
          offset: payload?.text?.animation?.exit?.offset,
        },
      },
    },
  };
};

export const createVariation = async (
  herotag: string,
  payload: Variation
): Promise<{
  variations: Variation[];
  files: { html: string; css: string; javascript: string };
}> => {
  const variationData = payloadToVariation(payload);
  const variationId = mongoose.Types.ObjectId();

  const newVariation = {
    _id: variationId,
    ...variationData,
  };

  const updatedUser = await User.findOneAndUpdate(
    { herotag: normalizeHerotag(herotag) },
    {
      $push: {
        "integrations.streamElements.variations": newVariation,
      },
    },
    { new: true }
  );

  return {
    variations: updatedUser?.integrations?.streamElements?.variations || [],
    files: getCodeSnippets(
      updatedUser?.herotag as string,
      updatedUser?.integrations?.streamElements?.variations || []
    ),
  };
};

export const getVariation = async (
  variationId: mongoose.Types.ObjectId
): Promise<Variation> => {
  const user = await User.findOne({
    "integrations.streamElements.variations._id": variationId,
  })
    .select({ "integrations.streamElements.variations": true })
    .lean();

  const variation = user?.integrations?.streamElements?.variations.find(
    ({ _id }) => String(_id) === String(variationId)
  );

  if (!variation) throw new Error("NO_VARIATION_FOUND");

  return variation;
};

export const getUserVariations = async (
  herotag: string
): Promise<Variation[]> => {
  const user = await User.findOne({
    herotag: normalizeHerotag(herotag),
  })
    .select({ "integrations.streamElements.variations": true })
    .lean();

  return user?.integrations?.streamElements?.variations || [];
};

const findHerotagByVariationId = async (
  variationId: mongoose.Types.ObjectId
): Promise<string> => {
  const user = await User.findOne({
    "integrations.streamElements.variations._id": variationId,
  })
    .select({ herotag: true })
    .lean();

  if (!user) throw new Error("");

  return user.herotag as string;
};

const createVariationFiles = (
  filepath: string,
  herotag: string,
  payload: Variation
) => {
  const [html, css, javascript]: [string, string, string] = [
    generatePreviewHtml(filepath),
    generateCss([payload]),
    generateJavascript(herotag, [payload], {
      triggerMode: "manual",
      targetVariation: payload.name,
    }),
  ];

  fs.writeFileSync(`../medias/files/${filepath}.html`, html);
  fs.writeFileSync(`../medias/files/${filepath}.css`, css);
  fs.writeFileSync(`../medias/files/${filepath}.js`, javascript);
};

const deleteVariationFiles = (filepath?: string) => {
  if (filepath) {
    try {
      fs.unlinkSync(`../medias/files/${filepath}.html`);
      fs.unlinkSync(`../medias/files/${filepath}.css`);
      fs.unlinkSync(`../medias/files/${filepath}.js`);
    } catch (error) {
      logger.error("failed to delete files", { error });
    }
  }
};

export const getCodeSnippets = (
  herotag: string,
  variations: Variation[]
): {
  html: string;
  css: string;
  javascript: string;
} => {
  const [html, css, javascript]: [string, string, string] = [
    generateSnippetHtml(),
    generateCss(variations),
    generateJavascript(herotag, variations),
  ];

  return {
    html,
    css,
    javascript,
  };
};

export const updateVariation = async (
  variationId: mongoose.Types.ObjectId,
  payload: Variation
): Promise<{
  variation: Variation;
  files: { html: string; css: string; javascript: string };
}> => {
  const herotag = await findHerotagByVariationId(variationId);
  const oldVariation = await getVariation(variationId);

  if (!oldVariation) throw new Error("VARIATION_NOT_FOUND");

  const variationFilesId = nanoid();

  const baseFilename = `${herotag.replace(/\W/g, "_")}_${formatVariationName(
    payload.name
  )}_${variationFilesId}`;

  const updates: Variation = payloadToVariation(payload);

  createVariationFiles(baseFilename, herotag, updates);

  const updatedUser = await User.findOneAndUpdate(
    { "integrations.streamElements.variations._id": variationId },
    {
      $set: {
        "integrations.streamElements.variations.$": {
          _id: variationId,
          filepath: baseFilename,
          ...updates,
        },
      },
    },
    { new: true }
  )
    .select({ "integrations.streamElements.variations": true })
    .lean();

  deleteVariationFiles(oldVariation?.filepath);

  const variations =
    updatedUser?.integrations?.streamElements?.variations || [];
  const updatedVariation = variations.find(
    ({ _id }) => String(_id) === String(variationId)
  ) as Variation;

  return {
    variation: updatedVariation,
    files: getCodeSnippets(herotag, variations),
  };
};

export const deleteVariation = async (
  variationId: mongoose.Types.ObjectId
): Promise<{
  variations: Variation[];
  files: { html: string; css: string; javascript: string };
}> => {
  const oldVariation = await getVariation(variationId);

  const updatedUser = await User.findOneAndUpdate(
    { "integrations.streamElements.variations._id": variationId },
    {
      $pull: {
        "integrations.streamElements.variations": { _id: variationId },
      },
    },
    { new: true }
  );

  deleteVariationFiles(oldVariation?.filepath);

  const files = getCodeSnippets(
    updatedUser?.herotag as string,
    updatedUser?.integrations?.streamElements?.variations || []
  );

  return {
    variations: updatedUser?.integrations?.streamElements?.variations || [],
    files,
  };
};

export const getRowsStructure = async (
  herotag: string
): Promise<{
  rows: string[];
  rowsGroupName?: string | undefined;
}[]> => {
  const user = await User.findOne({ herotag: normalizeHerotag(herotag) })
    .select({ "integrations.streamElements.rowsStructure": true })
    .lean();

  const rowsStructure = user?.integrations?.streamElements?.rowsStructure;

  if (!rowsStructure) return [];

  return rowsStructure;
};

export const updateRowsStructure = async (
  herotag: string,
  rowsStructure: {
    rows: string[];
    rowsGroupName?: string | undefined;
  }[]
): Promise<{
  rows: string[];
  rowsGroupName?: string | undefined;
}[]> => {
  await User.updateOne(
    { herotag: normalizeHerotag(herotag) },
    {
      $set: {
        "integrations.streamElements.rowsStructure": rowsStructure.filter(
          ({ rows }) => !!rows.length
        ),
      },
    }
  );

  return rowsStructure;
};
