/* eslint-disable @typescript-eslint/ban-ts-comment */
import express from "express";
import fs from "fs";
import path, { extname } from "path";
//@ts-ignore
require("express-async-errors");

import compression from "compression";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import multer from "multer";
//@ts-ignore
import xss from "xss-clean";

// const httpStatus = require("http-status");
// const config = require("./config/config");
// const { authLimiter } = require("./middlewares/rateLimiter");
import routes from "./api";
import errorMiddleware from "./middlewares/errorHandler";
import logger from "./services/logger";

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dirPath = `../../medias/${req.params.mediaType}`;

    fs.mkdirSync(dirPath, { recursive: true });
    return cb(
      null,
      path.resolve(__dirname, `../../medias/${req.params.mediaType}`)
    );
  },
  filename: function(req, file, cb) {
    cb(
      null,
      `${req.params.mediaType}_${Date.now()}${extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
}).single("media");

// const { errorConverter, errorHandler } = require("./middlewares/error");

const app = express();

app.use(function(req, res, next) {
  //allow cross origin requests
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, PUT, OPTIONS, DELETE, GET"
  );
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static(path.join("../medias/images")));
app.use("/audios", express.static(path.join("../medias/audios")));

app.post("/uploads/:mediaType", async (req, res) => {
  const filename = await new Promise((resolve, reject) => {
    upload(req, res, function(err: any) {
      if (err) {
        logger.error(err);
        reject(err);
      }

      resolve(req.file.filename);
    });
  });

  res.send(filename);
});

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

app.get("*", function() {
  throw new Error("ROUTE_NOT_FOUND");
});

app.use(errorMiddleware);

export default app;
