import express from "express";

import {
  createAlertsGroup,
  createVariation,
  deleteAlertsGroup,
  deleteVariation,
  updateAlertsGroup,
  updateVariation,
} from "../controllers/alerts";
import { authenticateMiddleware } from "../middlewares/authMiddleware";

const Router = express.Router();

Router.route("/alerts/variation")
  .post(authenticateMiddleware, createVariation)
  .put(authenticateMiddleware, updateVariation);

Router.route(
  "/alerts/herotag/:herotag/overlay/:overlayId/variation/:variationId"
).delete(authenticateMiddleware, deleteVariation);

Router.route("/alerts/group")
  .post(authenticateMiddleware, createAlertsGroup)
  .put(authenticateMiddleware, updateAlertsGroup);

Router.route(
  "/alerts/group/herotag/:herotag/overlay/:overlayId/group/:groupId"
).delete(authenticateMiddleware, deleteAlertsGroup);

export default Router;
