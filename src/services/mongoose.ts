import mongoose from "mongoose";

import { ENV } from "../utils/env";
import logger from "./logger";

export const connectToDatabase = async (): Promise<void> => {
  await mongoose
    .connect(getMongoUrlFromEnv(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(async () => {
      logger.info(`Connected to database : ${getMongoUrlFromEnv(true)}`);
    })
    .catch((error) => {
      logger.error({
        ...error,
        error: `Connection to database failed : ${getMongoUrlFromEnv(true)}`,
      });
    });
};

/**
 * Build the mongodb uri from env variables.
 * Require MONGODB_USER and MONGODB_PWD if in 'staging' or 'production' env.
 *
 * @param obfuscated {boolean} - Obfuscate auth params from output (default: false)
 * @returns {string} - The mongodb uri.
 */
export const getMongoUrlFromEnv = (obfuscated = false): string => {
  const {
    NODE_ENV,
    MONGODB_HOST,
    MONGODB_PORT,
    MONGODB_DBNAME,
    MONGODB_USER,
    MONGODB_PWD,
  } = ENV;

  // Prepare
  const prefix = "mongodb://";
  const auth = (MONGODB_USER && MONGODB_PWD) ? obfuscated ? "****:***" : [MONGODB_USER, MONGODB_PWD].join(":") : undefined;

  // Throw if environment is exposed and no auth has been set to the DB
  if (["production", "staging"].indexOf(`${NODE_ENV}`) >= 0 && (!MONGODB_USER || !MONGODB_PWD)) {
    throw new Error("MONGODB: In production or staging, your DB must have a 'MONGODB_USER' and a 'MONGODB_PWD'");
  }

  // Thow if no database set
  if (!MONGODB_DBNAME) {
    throw new Error("MONGODB: You must set the database 'MONGODB_DBNAME' name in your environment variables");
  }

  // Build and returns the mondb uri
  return `${prefix}${auth ? `${auth}@` : ""}${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DBNAME}`;

}
