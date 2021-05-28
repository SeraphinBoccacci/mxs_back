import express from "express";

import {
  addWidgetToOverlay,
  createOneOverlay,
  deleteOverlay,
  getManyUserOverlays,
  getUserOverlay,
} from "../controllers/overlays";
import { authenticateMiddleware } from "../middlewares/authMiddleware";

const Router = express.Router();

Router.route("/overlays/herotag/:herotag/overlay/:overlayId").get(
  getUserOverlay
);

Router.route("/overlays/herotag/:herotag/").get(
  authenticateMiddleware,
  getManyUserOverlays
);

Router.route("/overlays/herotag/:herotag/overlay").post(
  authenticateMiddleware,
  createOneOverlay
);

Router.route("/overlays/herotag/:herotag/overlay/:overlayId").delete(
  authenticateMiddleware,
  deleteOverlay
);

Router.route("/overlays/add-widget").post(
  authenticateMiddleware,
  addWidgetToOverlay
);

export default Router;
