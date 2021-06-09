import mongoose from "mongoose";

import User from "../../models/User";
import { AlertVariation, TextPositions } from "../../types/alerts";
import { VariationGroup, VariationGroupKinds } from "../../types/overlays";
import { normalizeHerotag } from "../../utils/transactions";

//TEST

const payloadToAlertVariation = (payload: AlertVariation): AlertVariation => {
  return {
    _id: payload._id,
    name: payload.name,
    duration: payload.duration || 10,
    chances: payload.chances || 100,
    requiredAmount: payload.requiredAmount || 0,
    backgroundColor: payload.backgroundColor,
    width: payload.width,
    heigth: payload.heigth,
    offsetTop: payload.offsetTop,
    offsetLeft: payload.offsetLeft,
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
      size: payload?.text?.size || "50",
      color: payload?.text?.color || "#2a2a2a",
      lineHeight: payload?.text?.lineHeight || "50",
      letterSpacing: payload?.text?.letterSpacing,
      wordSpacing: payload?.text?.wordSpacing,
      textAlign: payload?.text?.textAlign || "left",
      stroke: {
        width: payload.text?.stroke?.width || 1,
        color: payload.text?.stroke?.color || "#000000",
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
  overlayId: string,
  payload: AlertVariation
): Promise<void> => {
  const variationData = payloadToAlertVariation(payload);
  const variationId = mongoose.Types.ObjectId();

  const newVariation = {
    ...variationData,
    _id: variationId,
  };

  const user = await User.findOne({
    herotag: normalizeHerotag(herotag),
    "integrations.overlays._id": overlayId,
  })
    .select({ "integrations.overlays": true })
    .lean();

  const overlayToUpdate = user?.integrations?.overlays?.find(
    ({ _id }) => String(_id) === String(overlayId)
  );

  const groups = overlayToUpdate?.alerts.groups || [];

  const defaultGroupIndex = groups.findIndex(
    ({ kind }) => kind === VariationGroupKinds.DEFAULT
  );

  const updatedAlerts = {
    variations: [...(overlayToUpdate?.alerts.variations || []), newVariation],
    groups: [
      ...groups.slice(0, defaultGroupIndex),
      {
        ...groups[defaultGroupIndex],
        variationsIds: [
          ...groups[defaultGroupIndex].variationsIds,
          variationId,
        ],
      },
      ...groups.slice(defaultGroupIndex + 1, groups.length),
    ],
  };

  await User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
      "integrations.overlays._id": overlayId,
    },
    {
      $set: {
        "integrations.overlays.$.alerts": updatedAlerts,
      },
    },
    { new: true }
  );
};

export const getVariation = async (
  herotag: string,
  overlayId: string,
  variationId: string
): Promise<AlertVariation | null> => {
  const user = await User.findOne({
    herotag: normalizeHerotag(herotag),
    "integrations.overlays._id": overlayId,
  })
    .select({ "integrations.overlays": true })
    .lean();

  const overlay = user?.integrations?.overlays?.find(
    ({ _id }) => String(_id) === String(overlayId)
  );

  return (
    overlay?.alerts.variations.find(
      ({ _id }) => String(_id) === String(variationId)
    ) || null
  );
};

const findVariationAndReplace = (
  variations: AlertVariation[],
  updatedVariation: AlertVariation
) => {
  const updatedVariationIndex = variations.findIndex(
    ({ _id }) => String(updatedVariation._id) === String(_id)
  );

  const before = variations.slice(0, updatedVariationIndex);
  const after = variations.slice(updatedVariationIndex + 1, variations.length);

  return [...before, updatedVariation, ...after];
};

export const updateVariation = async (
  herotag: string,
  overlayId: string,
  payload: AlertVariation
): Promise<void> => {
  const user = await User.findOne({ herotag: normalizeHerotag(herotag) })
    .select({ "integrations.overlays": true })
    .orFail(new Error("USER_NOT_FOUND"))
    .lean();

  const overlayToUpdate = user?.integrations?.overlays?.find(
    ({ _id }) => String(_id) === String(overlayId)
  );

  if (!overlayToUpdate) throw new Error("OVERLAY_NOT_FOUND");

  const updatedVariation: AlertVariation = payloadToAlertVariation(payload);

  const updatedOverlay = {
    ...overlayToUpdate,
    alerts: {
      ...overlayToUpdate?.alerts,
      variations: findVariationAndReplace(
        overlayToUpdate.alerts.variations,
        updatedVariation
      ),
    },
  };

  await User.updateOne(
    { "integrations.overlays._id": overlayId },
    {
      $set: {
        "integrations.overlays.$": updatedOverlay,
      },
    }
  );
};

export const deleteVariation = async (
  herotag: string,
  overlayId: string,
  variationId: string
): Promise<void> => {
  const user = await User.findOne({ herotag: normalizeHerotag(herotag) })
    .select({ "integrations.overlays": true })
    .orFail(new Error("USER_NOT_FOUND"))
    .lean();

  const overlayToUpdate = user?.integrations?.overlays?.find(
    ({ _id }) => String(_id) === String(overlayId)
  );

  if (!overlayToUpdate) throw new Error("OVERLAY_NOT_FOUND");

  const updatedOverlay = {
    ...overlayToUpdate,
    alerts: {
      ...overlayToUpdate?.alerts,
      variations: overlayToUpdate.alerts.variations.filter(
        ({ _id }) => String(_id) !== String(variationId)
      ),
      groups: overlayToUpdate.alerts.groups.map(
        ({ variationsIds, ...group }) => ({
          ...group,
          variationsIds: variationsIds.filter(
            (id) => String(id) !== String(variationId)
          ),
        })
      ),
    },
  };

  await User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
      "integrations.overlays._id": overlayId,
    },
    {
      $set: {
        "integrations.overlays.$": updatedOverlay,
      },
    }
  );
};

export const createAlertsGroup = async (
  herotag: string,
  overlayId: string
): Promise<void> => {
  await User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
      "integrations.overlays._id": overlayId,
    },
    {
      $push: {
        "integrations.overlays.$.alerts.groups": {
          title: "Unnamed group",
          variationIds: [],
          kind: VariationGroupKinds.CUSTOM,
        },
      },
    }
  );
};

export const updateAlertsGroup = async (
  herotag: string,
  overlayId: string,
  updatedGroups: VariationGroup[]
): Promise<void> => {
  // Sanitize data
  const groups: VariationGroup[] = updatedGroups.map((group) => ({
    _id: group._id,
    title: group.title,
    variationsIds: group.variationsIds,
    kind: group.kind,
  }));

  await User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
      "integrations.overlays._id": overlayId,
    },
    {
      $set: {
        "integrations.overlays.$.alerts.groups": groups,
      },
    }
  );
};

export const deleteAlertsGroup = async (
  herotag: string,
  overlayId: string,
  groupId: string
): Promise<void> => {
  const user = await User.findOne({
    herotag: normalizeHerotag(herotag),
    "integrations.overlays._id": overlayId,
  })
    .select({ "integrations.overlays": true })
    .lean();

  const overlayToUpdate = user?.integrations?.overlays?.find(
    ({ _id }) => String(_id) === String(overlayId)
  );

  const groupToDelete = overlayToUpdate?.alerts.groups.find(
    ({ _id }) => String(_id) === String(groupId)
  );

  if (groupToDelete?.kind === VariationGroupKinds.DEFAULT)
    throw new Error("CANT_DELETE_DEFAULT_GROUP");

  const groups: VariationGroup[] =
    overlayToUpdate?.alerts.groups
      .filter(
        ({ _id, kind }) =>
          String(_id) !== String(groupId) ||
          kind === VariationGroupKinds.DEFAULT
      )
      .map((group) => {
        return {
          _id: group._id,
          title: group.title,
          variationsIds:
            group.kind === VariationGroupKinds.DEFAULT
              ? [
                  ...group.variationsIds,
                  ...(groupToDelete?.variationsIds || []),
                ]
              : group.variationsIds,
          kind: group.kind,
        };
      }) || [];

  await User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
      "integrations.overlays._id": overlayId,
    },
    {
      $set: {
        "integrations.overlays.$.alerts.groups": groups,
      },
    }
  );
};
