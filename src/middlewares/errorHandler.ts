/* eslint-disable @typescript-eslint/ban-ts-comment */
import cleanStack from "clean-stack";
import { Request, Response } from "express";

// Error handler middleware (DO NOT REMOVE NEXT)
const errorMiddleware = (err: Error, req: Request, res: Response): void => {
  if (typeof err === "string") {
    err = new Error(err);
  }

  //@ts-ignore
  const status = err.status || 500;

  err.stack = err.stack && cleanStack(err.stack);

  //@ts-ignore
  const { message, data = {}, ...remains } = err;

  let json = Object.assign({}, data);

  json.data = message;

  json.stack = err.stack;
  json = { ...json, ...remains };

  res.set("Content-Type", "application/json");
  res.status(status);
  res.send(json);
};

export default errorMiddleware;
