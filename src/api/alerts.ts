import express from "express";
import mongoose from "mongoose";

import { authenticateMiddleware } from "../middlewares/authMiddleware";
import {
  createAlertsGroup,
  createVariation,
  deleteVariation,
  getCodeSnippets,
  getUserVariations,
  getVariation,
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
      mongoose.Types.ObjectId(req.body.variationId),
      req.body.variation
    );

    res.send(result);
  });

Router.route("/alerts/variation/:variationId").get(
  authenticateMiddleware,
  async (req, res) => {
    const variation = await getVariation(
      mongoose.Types.ObjectId(req.params.variationId)
    );

    res.send(variation);
  }
);

Router.route(
  "/alerts/herotag/:herotag/overlay/:overlayId/variation/:variationId"
).delete(authenticateMiddleware, async (req, res) => {
  const result = await deleteVariation(
    req.params.herotag,
    mongoose.Types.ObjectId(req.params.overlayId),
    mongoose.Types.ObjectId(req.params.variationId)
  );

  res.send(result);
});

Router.route("/alerts/variations/:herotag").get(
  authenticateMiddleware,
  async (req, res) => {
    const variations = await getUserVariations(req.params.herotag);

    const files = getCodeSnippets(req.params.herotag, variations);

    res.send({ variations, files });
  }
);

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
