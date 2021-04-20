import express from "express";

import AlertsSubRouter from "./alerts";
import AuthSubRouter from "./auth";
import IftttSubRouter from "./ifttt";
import OverlaysSubRouter from "./overlays";
import UsersSubRouter from "./users";

const SubRouters = [
  AuthSubRouter,
  UsersSubRouter,
  OverlaysSubRouter,
  IftttSubRouter,
  AlertsSubRouter,
];

const MainRouter = SubRouters.reduce(
  (mainRouter, subRouter) => mainRouter.use(subRouter),
  express.Router()
);

export default MainRouter;
