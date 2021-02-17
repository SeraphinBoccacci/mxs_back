import express from "express";
import path from "path";
import fs from "fs";
//@ts-ignore
require("express-async-errors");

import helmet from "helmet";
//@ts-ignore
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import cors from "cors";

// const httpStatus = require("http-status");
// const config = require("./config/config");

// const { authLimiter } = require("./middlewares/rateLimiter");
import routes from "./api";
import errorMiddleware from "./middlewares/errorHandler";

// const { errorConverter, errorHandler } = require("./middlewares/error");

const app = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static(path.join("../medias/images")));
app.use("/audios", express.static(path.join("../medias/audios")));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
// app.options("*", cors());

// jwt authentication
// app.use(passport.initialize());
// passport.use("jwt", jwtStrategy);

// limit repeated failed requests to auth endpoints
// if (config.env === "production") {
//   app.use("/v1/auth", authLimiter);
// }

app.use("/api", routes);

// send back a 404 error for any unknown api request
// app.use((req: Request, res: Response, next: NextFunction) => {
//   next(new Error("Not found ---------------- !"));
// });

// convert error to ApiError, if needed
// app.use(errorConverter);

// handle error
// app.use(errorHandler);

if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "staging"
) {
  app.use(express.static(path.join(__dirname, "../../mxs_front/build")));

  app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "../../mxs_front/build/index.html"));
  });
}

app.use(errorMiddleware);

export default app;
