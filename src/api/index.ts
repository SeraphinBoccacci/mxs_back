/** @format */

import express from "express";

import AuthSubRouter from "./auth";
import UsersSubRouter from "./users";

const SubRouters = [AuthSubRouter, UsersSubRouter];

const MainRouter = SubRouters.reduce((mainRouter, subRouter) => mainRouter.use(subRouter), express.Router());

export default MainRouter;
