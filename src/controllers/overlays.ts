import { Request, Response } from "express";
import { nanoid } from "nanoid";

import User from "../models/User";
import { VariationGroupKinds } from "../types/overlays";
import { normalizeHerotag } from "../utils/transactions";

export const getOverlay = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { herotag, overlayId } = req.params;

  const user = await User.findOne({
    herotag: normalizeHerotag(herotag),
  })
    .select({ "integrations.overlays": true })
    .lean();

  const overlay = user?.integrations?.overlays?.find(({ generatedLink }) => {
    return overlayId === generatedLink;
  });

  res.send(overlay || null);
};

export const getUserOverlays = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { herotag } = req.params;

  const user = await User.findOne({
    herotag: normalizeHerotag(herotag),
  })
    .select({ "integrations.overlays": true })
    .lean();

  res.send(user?.integrations?.overlays || []);
};

export const createOneOverlay = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { herotag } = req.params;

  await User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
    },
    { $push: { "integrations.overlays": { generatedLink: nanoid(50) } } }
  );

  res.sendStatus(204);
};

export const deleteOneOverlay = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { herotag, overlayId } = req.params;

  await User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
      "integrations.overlays._id": overlayId,
    },
    { $pull: { "integrations.overlays": { _id: overlayId } } }
  );

  res.sendStatus(204);
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
  req: Request,
  res: Response
): Promise<void> => {
  const { herotag, overlayId, widget } = req.body;
  if (widget === WidgetsKinds.ALERTS) {
    await addAlerts(herotag, overlayId);

    res.sendStatus(204);
    return;
  }
};
