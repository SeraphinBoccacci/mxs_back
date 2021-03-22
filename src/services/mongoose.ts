import mongoose from "mongoose";

import config from "../config/config";
import logger from "./logger";

export const connectToDatabase = async (): Promise<void> => {
  mongoose
    .connect(config.dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(async () => {
      logger.info("Connected to database");
    })
    .catch((error) => {
      logger.error("Connection to database failed", { error });
    });
};
