import express from "express";
import { authenticateMiddleware } from "../middlewares/authMiddleware";
import { toggleTransactionsDetection } from "../processes/maiar";
import {
  getUserData,
  toggleIftttIntegration,
  updateIftttIntegrationData,
} from "../processes/user";
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

export default Router;
