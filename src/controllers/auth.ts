import { Request, Response } from "express";

import * as authenticationProcesses from "../processes/authentication";

export const authenticateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authData = await authenticationProcesses.authenticateUser(req.body);

  res.send(authData);
};

export const createUserAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const creationData = await authenticationProcesses.createUserAccount(
    req.body
  );

  res.send(creationData);
};

export const editPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  await authenticationProcesses.editPassword(req.body);

  res.sendStatus(204);
};

export const isProfileVerified = async (
  req: Request,
  res: Response
): Promise<void> => {
  const isVerified = await authenticationProcesses.isProfileVerified(
    req.params.herotag
  );

  res.send(isVerified);
};

export const getVerificationReference = async (
  req: Request,
  res: Response
): Promise<void> => {
  const reference = await authenticationProcesses.getVerificationReference(
    req.params.herotag
  );

  res.send(reference);
};

export const isHerotagValid = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await authenticationProcesses.isHerotagValid(
    req.params.herotag
  );

  res.send(result);
};
