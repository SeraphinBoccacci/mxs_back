import express from "express";

import { authenticateMiddleware } from "../middlewares/authMiddleware";
import {
  toggleIftttParticle,
  updateIftttParticleData,
} from "../processes/user";
const Router = express.Router();

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

export default Router;
