import axios from "axios";
import { Request, Response } from "express";

import * as blockchainInteractionProcesses from "../processes/blockchain-interaction";
import * as blockchainMonitoringProcesses from "../processes/blockchain-monitoring";
import * as userProcesses from "../processes/user";
import { RequestWithHerotag } from "../types/express";

export const getUserData = async (
  req: RequestWithHerotag,
  res: Response
): Promise<void> => {
  if (!req?.herotag) {
    res.sendStatus(403);
    return;
  }

  const user = await userProcesses.getUserData(req?.herotag);

  res.send(user);
};

export const toggleBlockchainMonitoring = async (
  req: Request,
  res: Response
): Promise<void> => {
  await blockchainMonitoringProcesses.toggleBlockchainMonitoring(
    req.params.herotag,
    req.body.isStreaming
  );

  res.sendStatus(204);
};

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

export const triggerFakeEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  await blockchainInteractionProcesses.triggerFakeEvent(
    req.body.herotag,
    req.body.data
  );

  res.sendStatus(204);
};

export const updateMinimumRequiredAmount = async (
  req: Request,
  res: Response
): Promise<void> => {
  await userProcesses.updateMinimumRequiredAmount(
    req.body.herotag,
    req.body.minimumRequiredAmount
  );

  res.sendStatus(204);
};

export const updateViewerOnboardingData = async (
  req: Request,
  res: Response
): Promise<void> => {
  await userProcesses.updateViewerOnboardingData(
    req.body.herotag,
    req.body.referralLink,
    req.body.herotagQrCodePath
  );

  res.sendStatus(204);
};

export const getViewerOnboardingData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await userProcesses.getViewerOnboardingData(req.params.herotag);

  res.send({
    referralLink: user?.referralLink,
    herotagQrCodePath: user?.herotagQrCodePath,
  });
};

export const getEgldPrice = async (
  req: Request,
  res: Response
): Promise<void> => {
  const response = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=elrond-erd-2&vs_currencies=usd"
  );

  if (!response) {
    res.sendStatus(200);

    return;
  }

  const price = response.data["elrond-erd-2"].usd;

  res.send({ price });
};
