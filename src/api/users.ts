import axios from "axios";
import express from "express";

import { authenticateMiddleware } from "../middlewares/authMiddleware";
import { reactToNewTransaction } from "../processes/blockchain-interaction";
import { toggleBlockchainMonitoring } from "../processes/blockchain-monitoring";
import {
  getUserData,
  getViewerOnboardingData,
  toggleIftttParticle,
  updateIftttParticleData,
  updateMinimumRequiredAmount,
  updateViewerOnboardingData,
} from "../processes/user";
import { EventData, MockedElrondTransaction } from "../types";
import { RequestWithHerotag } from "../types/express";

const Router = express.Router();

Router.route("/user/herotag").get(
  authenticateMiddleware,
  async (req: RequestWithHerotag, res) => {
    if (!req?.herotag) return res.sendStatus(403);

    const user = await getUserData(req?.herotag);

    res.send(user);
  }
);

Router.route("/user/poll-maiar/:herotag").post(
  authenticateMiddleware,
  async (req, res) => {
    await toggleBlockchainMonitoring(req.params.herotag, req.body.isStreaming);

    res.sendStatus(204);
  }
);

// define the home page route
Router.route("/user/ifttt/:herotag").post(
  authenticateMiddleware,
  async (req, res) => {
    await updateIftttParticleData(req.params.herotag, req.body.ifttt);

    res.sendStatus(204);
  }
);

Router.route("/user/ifttt/is-active/:herotag").post(
  authenticateMiddleware,
  async (req, res) => {
    await toggleIftttParticle(req.params.herotag, req.body.isActive);

    res.sendStatus(204);
  }
);

const defaultMockedEventData: EventData = {
  herotag: "test_herotag",
  amount: "0.001",
  data: "test message",
};

Router.route("/user/trigger-event").post(
  authenticateMiddleware,
  async (req, res) => {
    const user = await getUserData(req.body.herotag);

    const mockedTransaction: MockedElrondTransaction = {
      isMockedTransaction: true,
      ...defaultMockedEventData,
      ...req.body.data,
    };

    if (user) await reactToNewTransaction(mockedTransaction, user);

    res.sendStatus(204);
  }
);

Router.route("/user/minimum-required-amount").post(
  authenticateMiddleware,
  async (req, res) => {
    await updateMinimumRequiredAmount(
      req.body.herotag,
      req.body.minimumRequiredAmount
    );

    res.sendStatus(204);
  }
);

Router.route("/user/viewers-onboarding-data").post(
  authenticateMiddleware,
  async (req, res) => {
    await updateViewerOnboardingData(
      req.body.herotag,
      req.body.referralLink,
      req.body.herotagQrCodePath
    );

    res.sendStatus(204);
  }
);

Router.route("/user/viewers-onboarding-data/herotag/:herotag").get(
  async (req, res) => {
    const user = await getViewerOnboardingData(req.params.herotag);

    res.send({
      referralLink: user?.referralLink,
      herotagQrCodePath: user?.herotagQrCodePath,
    });
  }
);

Router.route("/egld-price").get(async (req, res) => {
  const response = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=elrond-erd-2&vs_currencies=usd"
  );

  if (!response) {
    res.sendStatus(200);

    return;
  }

  const price = response.data["elrond-erd-2"].usd;

  res.send({ price });
});

export default Router;
