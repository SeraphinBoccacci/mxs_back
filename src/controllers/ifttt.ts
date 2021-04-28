import { Request, Response } from "express";

import * as userProcesses from "../processes/user";

export const updateIftttParticleData = async (
  req: Request,
  res: Response
): Promise<void> => {
  await userProcesses.updateIftttParticleData(
    req.params.herotag,
    req.body.ifttt
  );

  res.sendStatus(204);
};

export const toggleIftttParticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  await userProcesses.toggleIftttParticle(
    req.params.herotag,
    req.body.isActive
  );

  res.sendStatus(204);
};
