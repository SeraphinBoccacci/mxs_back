import express from "express";

import { authenticateMiddleware } from "../middlewares/authMiddleware";
import {
  createAlertsGroup,
  createVariation,
  deleteVariation,
  updateAlertsGroup,
  updateVariation,
} from "../processes/overlays";

const Router = express.Router();

Router.route("/alerts/variation")
  .post(authenticateMiddleware, async (req, res) => {
    const result = await createVariation(
      req.body.herotag,
      req.body.overlayId,
      req.body.variation
    );

    res.send(result);
  })
  .put(authenticateMiddleware, async (req, res) => {
    const result = await updateVariation(
      req.body.herotag,
      req.body.overlayId,
      req.body.payload
    );

    res.send(result);
  });

Router.route(
  "/alerts/herotag/:herotag/overlay/:overlayId/variation/:variationId"
).delete(authenticateMiddleware, async (req, res) => {
  const result = await deleteVariation(
    req.params.herotag,
    req.params.overlayId,
    req.params.variationId
  );

  res.send(result);
});

Router.route("/alerts/group")
  .post(authenticateMiddleware, async (req, res) => {
    await createAlertsGroup(req.body.herotag, req.body.overlayId);

    res.sendStatus(204);
  })
  .put(authenticateMiddleware, async (req, res) => {
    await updateAlertsGroup(
      req.body.herotag,
      req.body.overlayId,
      req.body.groups
    );

    res.sendStatus(204);
  });

export default Router;
