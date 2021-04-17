/** @format */

import { NextFunction, Response } from "express";

import logger from "../services/logger";
import { RequestWithHerotag } from "../types/express";

export const requestLoggerMiddleware = async (req: RequestWithHerotag, res: Response, next: NextFunction): Promise<void> => {
  logger.info(`${req.method} ${req.url}`);

  next();
};
