import express from "express";

import {
  addBannedAddress,
  addBannedWord,
  addVipAddress,
  removeBannedAddress,
  removeBannedWord,
  removeVipAddress,
} from "../controllers/moderation";
import { authenticateMiddleware } from "../middlewares/authMiddleware";

const Router = express.Router();

Router.route("/moderation/add-banned-word").put(
  authenticateMiddleware,
  addBannedWord
);

Router.route("/moderation/add-banned-address").put(
  authenticateMiddleware,
  addBannedAddress
);

Router.route("/moderation/add-vip-address").put(
  authenticateMiddleware,
  addVipAddress
);

Router.route("/moderation/remove-banned-word").put(
  authenticateMiddleware,
  removeBannedWord
);

Router.route("/moderation/remove-banned-address").put(
  authenticateMiddleware,
  removeBannedAddress
);

Router.route("/moderation/remove-vip-address").put(
  authenticateMiddleware,
  removeVipAddress
);

export default Router;
