import express from "express";

import {
  authenticateUser,
  createUserAccount,
  editPassword,
  getVerificationReference,
  isHerotagValid,
  isProfileVerified,
} from "../controllers/auth";

const Router = express.Router();

Router.post("/authenticate", authenticateUser);

Router.post("/create-account", createUserAccount);

Router.post("/edit-password", editPassword);

Router.get("/verification-status/:herotag", isProfileVerified);

Router.get("/verification-reference/:herotag", getVerificationReference);

Router.get("/is-valid-herotag/:herotag", isHerotagValid);

export default Router;
