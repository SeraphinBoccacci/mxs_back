import express from "express";

import {
  addWidgetToOverlay,
  createOneOverlay,
  deleteOneOverlay,
  getOverlay,
  getUserOverlays,
} from "../controllers/overlays";
import { authenticateMiddleware } from "../middlewares/authMiddleware";
import { toggleStreamElementsParticle } from "../processes/user";

const Router = express.Router();

Router.route("/overlays/herotag/:herotag/overlay/:overlayId").get(
  async (req, res) => {
    const { herotag, overlayId } = req.params;

    const overlay = await getOverlay(herotag, overlayId);

    res.send(overlay);
  }
);

Router.route("/overlays/herotag/:herotag/").get(
  authenticateMiddleware,
  async (req, res) => {
    const { herotag } = req.params;

    const overlays = await getUserOverlays(herotag);

    res.send(overlays);
  }
);

Router.route("/overlays/herotag/:herotag/overlay").post(
  authenticateMiddleware,
  async (req, res) => {
    const { herotag } = req.params;

    const overlays = await createOneOverlay(herotag);

    res.send(overlays);
  }
);

Router.route("/overlays/herotag/:herotag/overlay/:overlayId").delete(
  authenticateMiddleware,
  async (req, res) => {
    const { herotag, overlayId } = req.params;

    const overlays = await deleteOneOverlay(herotag, overlayId);

    res.send(overlays);
  }
);

Router.route("/overlays/is-active/:herotag").post(
  authenticateMiddleware,
  async (req, res) => {
    await toggleStreamElementsParticle(req.params.herotag, req.body.isActive);

    res.sendStatus(204);
  }
);

Router.route("/overlays/add-widget").post(
  authenticateMiddleware,
  async (req, res) => {
    await addWidgetToOverlay(
      req.body.herotag,
      req.body.overlayId,
      req.body.widget
    );

    res.sendStatus(204);
  }
);

export default Router;
