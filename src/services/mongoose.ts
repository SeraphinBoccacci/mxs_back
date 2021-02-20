import mongoose from "mongoose";

import logger from "./logger";

export const connectToDatabase = async (): Promise<void> => {
  mongoose
    .connect("mongodb://localhost:27017/mxs", {
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
