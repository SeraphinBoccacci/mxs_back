import express from "express";

import {
  addWidgetToOverlay,
  createOneOverlay,
  deleteOneOverlay,
  getOverlay,
  getUserOverlays,
} from "../controllers/overlays";
import { authenticateMiddleware } from "../middlewares/authMiddleware";

const Router = express.Router();

Router.route("/overlays/herotag/:herotag/overlay/:overlayId").get(getOverlay);

Router.route("/overlays/herotag/:herotag/").get(
  authenticateMiddleware,
  getUserOverlays
);

Router.route("/overlays/herotag/:herotag/overlay").post(
  authenticateMiddleware,
  createOneOverlay
);

Router.route("/overlays/herotag/:herotag/overlay/:overlayId").delete(
  authenticateMiddleware,
  deleteOneOverlay
);

Router.route("/overlays/add-widget").post(
  authenticateMiddleware,
  addWidgetToOverlay
);

export default Router;
