import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  var bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, "secretkey", (err, result) => {
      if (err) {
        res.sendStatus(403);
      } else {
        next();
      }
    });
  } else {
    res.sendStatus(403);
  }
};

interface JwtDecoded {
  herotag: string;
}

export const authenticateMiddleware = (
  req: Request & { herotag?: string },
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;
  const token = authorization && authorization.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  try {
    const jwtPayload = <JwtDecoded>(
      jwt.verify(
        token,
        "Curtness24Radium89Honestly41Memo's83Casuals35cherishes09Sanctification97restarting42slot's28ephemerides"
      )
    );

    if (req.params.herotag !== jwtPayload.herotag)
      throw new Error("cant_access_herotag");

    req.herotag = jwtPayload.herotag;

    next();
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    res.status(401).send(error);
    return;
  }
};
