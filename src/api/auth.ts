import express from "express";

import {
  authenticateUser,
  createUserAccount,
  getVerificationReference,
  isProfileVerified,
} from "../processes/auth";

const Router = express.Router();

Router.post("/authenticate", async (req, res) => {
  const authData = await authenticateUser(req.body);

  res.send(authData);
});

Router.post("/create-account", async (req, res) => {
  const creationData = await createUserAccount(req.body);

  res.send(creationData);
});

Router.get("/verification-status/:herotag", async (req, res) => {
  const isVerified = await isProfileVerified(req.params.herotag);

  res.send(isVerified);
});

Router.get("/verification-reference/:herotag", async (req, res) => {
  const reference = await getVerificationReference(req.params.herotag);

  res.send(reference);
});

export default Router;
