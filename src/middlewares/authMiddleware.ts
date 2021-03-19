import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import logger from "../services/logger";
import { normalizeHerotag } from "../utils/transactions";

interface JwtDecoded {
  herotag: string;
}

export const authenticateMiddleware = (
  req: Request & { herotag?: string },
  res: Response,
  next: NextFunction
): void => {
  const { authorization } = req.headers;

  const token = authorization && authorization.split(" ")[1];

  if (token == null) {
    res.sendStatus(401);
    return;
  }

  try {
    const jwtPayload = <JwtDecoded>(
      jwt.verify(
        token,
        "Curtness24Radium89Honestly41Memo's83Casuals35cherishes09Sanctification97restarting42slot's28ephemerides"
      )
    );

    if (normalizeHerotag(req.params.herotag as string) !== jwtPayload.herotag)
      throw new Error("cant_access_herotag");

    req.herotag = jwtPayload.herotag;

    next();
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    logger.error("Auth failed", { error });

    res.status(401).send(error);
    return;
  }
};
