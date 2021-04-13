import mongoose from "mongoose";

import config from "../config/config";
import logger from "./logger";

export const connectToDatabase = async (): Promise<void> => {
  await mongoose
    .connect(config.dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(async () => {
      logger.info(`Connected to database : ${config.dbUri}`);
    })
    .catch((error) => {
      logger.error({
        ...error,
        error: "Connection to database failed",
      });
    });
};
