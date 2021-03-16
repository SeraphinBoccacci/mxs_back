import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

import User, { UserAccountStatus } from "../models/User";
import logger from "../services/logger";
import { RequestWithHerotag } from "../types/express";
import { normalizeHerotag } from "../utils/transactions";

interface JwtDecoded {
  herotag: string;
}

export const authenticateMiddleware = async (
  req: RequestWithHerotag,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    const user = await User.findOne({
      herotag: normalizeHerotag(jwtPayload.herotag),
    })
      .select({ status: true })
      .orFail(new Error("NOT_REGISTERED_HEROTAG"))
      .lean();

    if (user?.status === UserAccountStatus.PENDING_VERIFICATION)
      throw new Error("USER_WITH_STILL_PENDING_VERIFICATION");

    req.herotag = jwtPayload.herotag;

    next();
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    logger.error("Auth failed " + error);

    res.status(401).send(error);
    return;
  }
};
