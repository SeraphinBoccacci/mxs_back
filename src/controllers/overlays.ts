import { nanoid } from "nanoid";

import { VariationGroupKinds } from "../models/schemas/VariationGroup";
import User, { OverlayData } from "../models/User";
import { normalizeHerotag } from "../utils/transactions";

export const getOverlay = async (
  herotag: string,
  overlayId: string
): Promise<OverlayData | null> => {
  const user = await User.findOne({
    herotag: normalizeHerotag(herotag),
  })
    .select({ "integrations.overlays": true })
    .lean();

  const overlay = user?.integrations?.overlays?.find(({ generatedLink }) => {
    return overlayId === generatedLink;
  });

  return overlay || null;
};

export const getUserOverlays = async (
  herotag: string
): Promise<OverlayData[]> => {
  const user = await User.findOne({
    herotag: normalizeHerotag(herotag),
  })
    .select({ "integrations.overlays": true })
    .lean();

  return user?.integrations?.overlays || [];
};

export const createOneOverlay = async (herotag: string): Promise<void> => {
  await User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
    },
    { $push: { "integrations.overlays": { generatedLink: nanoid(50) } } }
  );
};

export const deleteOneOverlay = async (
  herotag: string,
  overlayId: string
): Promise<void> => {
  await User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
      "integrations.overlays._id": overlayId,
    },
    { $pull: { "integrations.overlays": { _id: overlayId } } }
  );
};

const addAlerts = (herotag: string, overlayId: string) => {
  return User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
      "integrations.overlays._id": overlayId,
    },
    {
      $set: {
        "integrations.overlays.$.alerts": {
          variations: [],
          groups: [
            {
              kind: VariationGroupKinds.DEFAULT,
              variationsIds: [],
              title: "Unclassed Variations",
            },
          ],
        },
      },
    }
  );
};

enum WidgetsKinds {
  "ALERTS" = "ALERTS",
}

export const addWidgetToOverlay = async (
  herotag: string,
  overlayId: string,
  widget: WidgetsKinds
): Promise<void> => {
  if (widget === WidgetsKinds.ALERTS) {
    await addAlerts(herotag, overlayId);

    return;
  }
};
