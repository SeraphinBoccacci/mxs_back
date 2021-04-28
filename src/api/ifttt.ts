import express from "express";

import {
  toggleIftttParticle,
  updateIftttParticleData,
} from "../controllers/users";
import { authenticateMiddleware } from "../middlewares/authMiddleware";
const Router = express.Router();

// define the home page route
Router.route("/user/ifttt/:herotag").post(
  authenticateMiddleware,
  updateIftttParticleData
);

Router.route("/user/ifttt/is-active/:herotag").post(
  authenticateMiddleware,
  toggleIftttParticle
);

export default Router;
