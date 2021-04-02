import logger from "../services/logger";
import { connectToDatabase } from "../services/mongoose";
import cleanUnverifiedUserAccount from "./cleanUnverifiedUsers";

const buildExitHandler = (
  cleanupActions: (() => void | (() => Promise<void>))[]
) => {
  return async () => {
    logger.info("Cleaning up jobs ...");

    await Promise.all(cleanupActions.map(async (action) => await action()));

    process.exit();
  };
};

connectToDatabase().then(async () => {
  logger.info("Starting jobs");
  const unsubscribeCleanUnverifiedUserAccount = cleanUnverifiedUserAccount();

  const exitHandler = buildExitHandler([unsubscribeCleanUnverifiedUserAccount]);
  //do something when app is closing
  process.on("exit", exitHandler);

  //catches ctrl+c event
  process.on("SIGINT", exitHandler);

  // catches "kill pid" (for example: nodemon restart)
  process.on("SIGUSR1", exitHandler);
  process.on("SIGUSR2", exitHandler);

  //catches uncaught exceptions
  process.on("uncaughtException", exitHandler);
});
