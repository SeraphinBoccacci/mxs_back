import { Request, Response } from "express";

import * as donationBarProcesses from "../processes/donationBar";

export const getDonationBar = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await donationBarProcesses.getDonationBar(
    req.params.herotag,
    req.params.overlayId
  );

  res.send(result);
};

export const updateDonationBar = async (
  req: Request,
  res: Response
): Promise<void> => {
  await donationBarProcesses.updateDonationBar(
    req.body.herotag,
    req.body.overlayId,
    req.body.payload
  );

  res.sendStatus(201);
};

export const deleteDonationBar = async (
  req: Request,
  res: Response
): Promise<void> => {
  await donationBarProcesses.deleteDonationBar(
    req.params.herotag,
    req.params.overlayId
  );

  res.sendStatus(201);
};
