import express from "express";

import {
  deleteDonationBar,
  getDonationBar,
  updateDonationBar,
} from "../controllers/donationBar";
import { authenticateMiddleware } from "../middlewares/authMiddleware";

const Router = express.Router();

Router.route("/donationBar").put(authenticateMiddleware, updateDonationBar);

Router.route("/donationBar/herotag/:herotag/overlay/:overlayId")
  .get(authenticateMiddleware, getDonationBar)
  .delete(authenticateMiddleware, deleteDonationBar);

export default Router;
