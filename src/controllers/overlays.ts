import { Request, Response } from "express";

import * as overlaysProcesses from "../processes/overlays";

export const getUserOverlay = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { herotag, overlayId } = req.params;

  const overlay = await overlaysProcesses.getUserOverlay(herotag, overlayId);

  res.send(overlay || null);
};

export const getManyUserOverlays = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { herotag } = req.params;

  const overlays = await overlaysProcesses.getManyUserOverlays(herotag);

  res.send(overlays);
};

export const createOneOverlay = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { herotag } = req.params;

  await overlaysProcesses.createOverlay(herotag);

  res.sendStatus(204);
};

export const deleteOverlay = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { herotag, overlayId } = req.params;

  await overlaysProcesses.deleteOverlay(herotag, overlayId);

  res.sendStatus(204);
};

export const addWidgetToOverlay = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { herotag, overlayId, widget } = req.body;

  await overlaysProcesses.addWidgetToOverlay(herotag, overlayId, widget);

  res.sendStatus(204);
};

export const updateOverlayName = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { herotag, overlayId, overlayName } = req.body;

  await overlaysProcesses.updateOverlayName(herotag, overlayId, overlayName);

  res.sendStatus(204);
};

export const getOverlayFonts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { herotag, overlayLink } = req.params;

  const fonts = await overlaysProcesses.getOverlayFonts(herotag, overlayLink);

  res.send(fonts);
};
