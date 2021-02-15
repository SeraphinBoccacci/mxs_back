import express from "express";
import { EventData } from "../interfaces";
import { authenticateMiddleware } from "../middlewares/authMiddleware";
import { toggleTransactionsDetection } from "../processes/maiar";
import {
  getUserData,
  toggleIftttIntegration,
  updateIftttIntegrationData,
} from "../processes/user";
import { triggerIftttEvent } from "../services/ifttt";
import { triggerStreamElementsEvent } from "../services/streamElements";
const Router = express.Router();

Router.route("/user/:herotag").get(authenticateMiddleware, async (req, res) => {
  const user = await getUserData(req.params.herotag);

  res.send(user);
});
// define the home page route
Router.route("/user/ifttt/:herotag").post(async (req, res) => {
  await updateIftttIntegrationData(req.params.herotag, req.body.ifttt);

  res.sendStatus(204);
});

Router.route("/user/ifttt/is-active/:herotag").post(async (req, res) => {
  await toggleIftttIntegration(req.params.herotag, req.body.isActive);

  res.sendStatus(204);
});

Router.route("/user/poll-maiar/:herotag").post(async (req, res) => {
  await toggleTransactionsDetection(req.params.herotag, req.body.isStreaming);

  res.sendStatus(204);
});

Router.route("/user/trigger/ifttt").post(async (req, res) => {
  const user = await getUserData(req.body.herotag);

  if (!user?.integrations?.ifttt?.isActive)
    throw new Error("IFTTT_INTEGRATION_IS_NOT_ACTIVE");

  const mockedEventData: EventData = {
    herotag: "test_herotag",
    amount: "x.xxx",
    data: "test message",
  };

  await triggerIftttEvent(mockedEventData, user.integrations.ifttt);

  res.sendStatus(204);
});

Router.route("/user/trigger/streamElements").post(async (req, res) => {
  const user = await getUserData(req.body.herotag);

  if (!user) throw new Error("NO_USER_FOUND");

  // if (!user?.integrations?.streamElements?.isActive)
  //   throw new Error("IFTTT_INTEGRATION_IS_NOT_ACTIVE");

  const mockedEventData: EventData = {
    herotag: "test_herotag",
    amount: "x.xxx",
    data: "test message",
  };

  await triggerStreamElementsEvent(mockedEventData, user);

  res.sendStatus(204);
});

export default Router;
