import express from "express";

import {
  getDonationGoalSentAmount,
  getEgldPrice,
  getUserData,
  getViewerOnboardingData,
  resetDonationGoal,
  toggleBlockchainMonitoring,
  toggleIftttParticle,
  triggerFakeEvent,
  updateIftttParticleData,
  updateMinimumRequiredAmount,
  updateViewerOnboardingData,
} from "../controllers/users";
import { authenticateMiddleware } from "../middlewares/authMiddleware";

const Router = express.Router();

Router.route("/user/herotag").get(authenticateMiddleware, getUserData);

Router.route("/user/poll-maiar/:herotag").post(
  authenticateMiddleware,
  toggleBlockchainMonitoring
);

Router.route("/user/ifttt/:herotag").post(
  authenticateMiddleware,
  updateIftttParticleData
);

Router.route("/user/ifttt/is-active/:herotag").post(
  authenticateMiddleware,
  toggleIftttParticle
);

Router.route("/user/trigger-event").post(
  authenticateMiddleware,
  triggerFakeEvent
);

Router.route("/user/minimum-required-amount").post(
  authenticateMiddleware,
  updateMinimumRequiredAmount
);

Router.route("/user/viewers-onboarding-data").post(
  authenticateMiddleware,
  updateViewerOnboardingData
);

Router.route("/user/viewers-onboarding-data/herotag/:herotag").get(
  getViewerOnboardingData
);

Router.route("/egld-price").get(getEgldPrice);

Router.route("/donation-goal-sent-amount/:herotag")
  .get(getDonationGoalSentAmount)
  .put(authenticateMiddleware, resetDonationGoal);

export default Router;
