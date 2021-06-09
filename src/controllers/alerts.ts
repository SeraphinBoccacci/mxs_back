import { Request, Response } from "express";

import * as alertProcesses from "../processes/alerts";

export const createVariation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await alertProcesses.createVariation(
    req.body.herotag,
    req.body.overlayId,
    req.body.variation
  );

  res.send(result);
};

export const getVariation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await alertProcesses.getVariation(
    req.params.herotag,
    req.params.overlayId,
    req.params.variationId
  );

  res.send(result);
};

export const updateVariation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await alertProcesses.updateVariation(
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
  const result = await alertProcesses.deleteVariation(
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
  await alertProcesses.createAlertsGroup(req.body.herotag, req.body.overlayId);

  res.sendStatus(204);
};

export const updateAlertsGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  await alertProcesses.updateAlertsGroup(
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
  await alertProcesses.deleteAlertsGroup(
    req.params.herotag,
    req.params.overlayId,
    req.params.groupId
  );

  res.sendStatus(204);
};
