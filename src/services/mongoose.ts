import mongoose from "mongoose";

import logger from "./logger";

export const connectToDatabase = async (): Promise<void> => {
  const dbUri =
    process.env.NODE_ENV === "test"
      ? "mongodb://localhost:27017/mxs_test"
      : "mongodb://localhost:27017/mxs";

  mongoose
    .connect(dbUri, {
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
