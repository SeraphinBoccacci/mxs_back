import logger from "../services/logger";
import { connectToDatabase } from "../services/mongoose";
import cleanUnverifiedUserAccount from "./cleanUnverifiedUsers";

connectToDatabase().then(async () => {
  logger.info("Starting jobs");

  cleanUnverifiedUserAccount();
});
