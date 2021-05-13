import express from "express";

import AlertsSubRouter from "./alerts";
import AuthSubRouter from "./auth";
import DonationBarSubRouter from "./donationBar";
import IftttSubRouter from "./ifttt";
import OverlaysSubRouter from "./overlays";
import UsersSubRouter from "./users";

const SubRouters = [
  AlertsSubRouter,
  AuthSubRouter,
  DonationBarSubRouter,
  UsersSubRouter,
  OverlaysSubRouter,
  IftttSubRouter,
];

const MainRouter = SubRouters.reduce(
  (mainRouter, subRouter) => mainRouter.use(subRouter),
  express.Router()
);

export default MainRouter;
