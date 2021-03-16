import express from "express";

import {
  authenticateUser,
  createUserAccount,
  editPassword,
  getVerificationReference,
  isHerotagValid,
  isProfileVerified,
} from "../processes/authentication";

const Router = express.Router();

Router.post("/authenticate", async (req, res) => {
  const authData = await authenticateUser(req.body);

  res.send(authData);
});

Router.post("/create-account", async (req, res) => {
  const creationData = await createUserAccount(req.body);

  res.send(creationData);
});

Router.post("/edit-password", async (req, res) => {
  await editPassword(req.body);

  res.sendStatus(204);
});

Router.get("/verification-status/:herotag", async (req, res) => {
  const isVerified = await isProfileVerified(req.params.herotag);

  res.send(isVerified);
});

Router.get("/verification-reference/:herotag", async (req, res) => {
  const reference = await getVerificationReference(req.params.herotag);

  res.send(reference);
});

Router.get("/is-valid-herotag/:herotag", async (req, res) => {
  const result = await isHerotagValid(req.params.herotag);

  res.send(result);
});

export default Router;
