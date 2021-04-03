/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextFunction, Request, Response } from "express";

import logger from "../services/logger";

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const error = typeof err === "string" ? new Error(err) : err;

  logger.error({
    ...(!!req.params && { params: req.params }),
    ...(!!req.query && { query: req.query }),
    ...(!!req.body && { body: req.body }),
    url: req.url,
    error: error.message,
    stack: error.stack,
  });

  //@ts-ignore
  const status = error.status || 500;

  const { message } = error;

  res.status(status).send({ message });
};

export default errorMiddleware;
