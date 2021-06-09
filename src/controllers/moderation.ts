import { Request, Response } from "express";

import * as moderationProcesses from "../processes/moderation";

export const addBannedWord = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, wordToAdd } = req.body;

  await moderationProcesses.addBannedWord(userId, wordToAdd);

  res.sendStatus(201);
};

export const addBannedAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, addressToAdd } = req.body;

  await moderationProcesses.addBannedAddress(userId, addressToAdd);

  res.sendStatus(201);
};

export const addVipAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, addressToAdd } = req.body;

  await moderationProcesses.addVipAddress(userId, addressToAdd);

  res.sendStatus(201);
};

export const removeBannedWord = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, wordToRemove } = req.body;

  await moderationProcesses.removeBannedWord(userId, wordToRemove);

  res.sendStatus(201);
};

export const removeBannedAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, addressToRemove } = req.body;

  await moderationProcesses.removeBannedAddress(userId, addressToRemove);

  res.sendStatus(201);
};

export const removeVipAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, addressToRemove } = req.body;

  await moderationProcesses.removeVipAddress(userId, addressToRemove);

  res.sendStatus(201);
};
