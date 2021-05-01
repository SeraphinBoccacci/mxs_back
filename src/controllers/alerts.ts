import { Request, Response } from "express";

import * as overlayProcesses from "../processes/overlays";

export const createVariation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await overlayProcesses.createVariation(
    req.body.herotag,
    req.body.overlayId,
    req.body.variation
  );

  res.send(result);
};

export const updateVariation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await overlayProcesses.updateVariation(
    req.body.herotag,
    req.body.overlayId,
    req.body.payload
  );

  res.send(result);
};

export const deleteVariation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await overlayProcesses.deleteVariation(
    req.params.herotag,
    req.params.overlayId,
    req.params.variationId
  );

  res.send(result);
};

export const createAlertsGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  await overlayProcesses.createAlertsGroup(
    req.body.herotag,
    req.body.overlayId
  );

  res.sendStatus(204);
};

export const updateAlertsGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  await overlayProcesses.updateAlertsGroup(
    req.body.herotag,
    req.body.overlayId,
    req.body.groups
  );

  res.sendStatus(204);
};

export const deleteAlertsGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  await overlayProcesses.deleteAlertsGroup(
    req.params.herotag,
    req.params.overlayId,
    req.params.groupId
  );

  res.sendStatus(204);
};
