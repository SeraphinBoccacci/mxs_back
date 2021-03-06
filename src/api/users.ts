import express from "express";
import mongoose from "mongoose";

import { authenticateMiddleware } from "../middlewares/authMiddleware";
import { triggerIftttEvent } from "../processes/blockchain-interaction/ifttt";
import { triggerStreamElementsEvent } from "../processes/blockchain-interaction/streamElements";
import { toggleBlockchainMonitoring } from "../processes/blockchain-monitoring";
import {
  createVariation,
  deleteVariation,
  getCodeSnippets,
  getRowsStructure,
  getUserVariations,
  getVariation,
  updateRowsStructure,
  updateVariation,
} from "../processes/stream-elements";
import {
  getUserData,
  toggleIftttIntegration,
  updateIftttIntegrationData,
} from "../processes/user";
import { EventData } from "../types";
const Router = express.Router();

Router.route("/user/:herotag").get(authenticateMiddleware, async (req, res) => {
  const user = await getUserData(req.params.herotag);

  res.send(user);
});

Router.route("/user/poll-maiar/:herotag").post(
  authenticateMiddleware,
  async (req, res) => {
    await toggleBlockchainMonitoring(req.params.herotag, req.body.isStreaming);

    res.sendStatus(204);
  }
);

// define the home page route
Router.route("/user/ifttt/:herotag").post(
  authenticateMiddleware,
  async (req, res) => {
    await updateIftttIntegrationData(req.params.herotag, req.body.ifttt);

    res.sendStatus(204);
  }
);

Router.route("/user/ifttt/is-active/:herotag").post(
  authenticateMiddleware,
  async (req, res) => {
    await toggleIftttIntegration(req.params.herotag, req.body.isActive);

    res.sendStatus(204);
  }
);

Router.route("/user/stream-elements/variation")
  .post(authenticateMiddleware, async (req, res) => {
    const result = await createVariation(req.body.herotag, req.body.variation);

    res.send(result);
  })
  .put(authenticateMiddleware, async (req, res) => {
    const result = await updateVariation(
      mongoose.Types.ObjectId(req.body.variationId),
      req.body.variation
    );

    res.send(result);
  });

Router.route("/user/stream-elements/variation/:variationId")
  .get(authenticateMiddleware, async (req, res) => {
    const variation = await getVariation(
      mongoose.Types.ObjectId(req.params.variationId)
    );

    res.send(variation);
  })
  .delete(authenticateMiddleware, async (req, res) => {
    const result = await deleteVariation(
      mongoose.Types.ObjectId(req.params.variationId)
    );

    res.send(result);
  });

Router.route("/user/stream-elements/variations/:herotag").get(
  authenticateMiddleware,
  async (req, res) => {
    const variations = await getUserVariations(req.params.herotag);

    const files = getCodeSnippets(req.params.herotag, variations);

    res.send({ variations, files });
  }
);

Router.route("/user/stream-elements/rows-structure/:herotag").get(
  authenticateMiddleware,
  async (req, res) => {
    const rowsStructure = await getRowsStructure(req.params.herotag);

    res.send(rowsStructure);
  }
);

Router.route("/user/stream-elements/rows-structure").post(
  authenticateMiddleware,
  async (req, res) => {
    await updateRowsStructure(req.body.herotag, req.body.rowsStructure);

    res.sendStatus(204);
  }
);

Router.route("/user/trigger/ifttt").post(
  authenticateMiddleware,
  async (req, res) => {
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
  }
);

Router.route("/user/trigger/streamElements").post(
  authenticateMiddleware,
  async (req, res) => {
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
  }
);

export default Router;
