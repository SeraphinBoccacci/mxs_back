import { NextFunction, Response } from "express";

import User, { UserAccountStatus } from "../models/User";
import { jwtPayload } from "../services/jwt";
import { RequestWithHerotag } from "../types/express";
import { normalizeHerotag } from "../utils/transactions";

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
    const payload = jwtPayload(token);

    const user = await User.findOne({
      herotag: normalizeHerotag(payload.herotag),
    })
      .select({ status: true })
      .orFail(new Error("NOT_REGISTERED_HEROTAG"))
      .lean();

    if (user?.status === UserAccountStatus.PENDING_VERIFICATION)
      throw new Error("USER_WITH_STILL_PENDING_VERIFICATION");

    req.herotag = payload.herotag;

    next();
  } catch (error) {
    throw new Error("INVALID_TOKEN");
  }
};
