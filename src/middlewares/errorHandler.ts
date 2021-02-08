import { NextFunction, Request, Response } from "express";

import cleanStack from "clean-stack";

// Error handler middleware (DO NOT REMOVE NEXT)
const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (typeof err === "string") {
    err = new Error(err);
  }

  //@ts-ignore
  const status = err.status || 500;

  err.stack = err.stack && cleanStack(err.stack);
  console.error(
    {
      err,
      req: {
        method: req.method,
        url: req.url,
      },
    },
    err.message
  );

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
