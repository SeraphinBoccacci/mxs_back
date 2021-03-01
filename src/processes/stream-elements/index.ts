import mongoose from "mongoose";

import User from "../../models/User";
import { Variation } from "../../types/streamElements";
import { normalizeHerotag } from "../../utils/transactions";

const payloadToVariation = (payload: Variation) => {
  return {
    name: payload.name,
    duration: payload.duration,
    chances: payload.chances,
    requiredAmount: payload.requiredAmount,
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
      position: payload?.text?.position,
      content: payload?.text?.content,
      width: payload?.text?.width,
      height: payload?.text?.height,
      size: payload?.text?.size,
      color: payload?.text?.color,
      lineHeight: payload?.text?.lineHeight,
      letterSpacing: payload?.text?.letterSpacing,
      wordSpacing: payload?.text?.wordSpacing,
      textAlign: payload?.text?.textAlign,
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
): Promise<Variation> => {
  const variationData = payloadToVariation(payload);
  const variationId = mongoose.Types.ObjectId();

  const newVariation = {
    _id: variationId,
    ...variationData,
  };

  await User.updateOne(
    { herotag: normalizeHerotag(herotag) },
    {
      $push: {
        "integrations.streamElements.variations": newVariation,
      },
    },
    { new: true }
  );

  return newVariation;
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

export const updateVariation = async (
  variationId: mongoose.Types.ObjectId,
  payload: Variation
): Promise<void> => {
  const updates: Variation = payloadToVariation(payload);

  await User.updateOne(
    { "integrations.streamElements.variations._id": variationId },
    {
      $set: {
        "integrations.streamElements.variations.$": {
          _id: variationId,
          ...updates,
        },
      },
    }
  );
};

export const deleteVariation = async (
  variationId: mongoose.Types.ObjectId
): Promise<void> => {
  await User.updateOne(
    { "integrations.streamElements.variations._id": variationId },
    {
      $pull: {
        "integrations.streamElements.variations": { _id: variationId },
      },
    }
  );
};
