import { connectToDatabase } from "./services/mongoose";

connectToDatabase();

import http from "http";

import app from "./app";
import config from "./config/config";
import { pollTransactionsToVerifyAccountStatuses } from "./processes/authentication";
import { resumeBlockchainMonitoring } from "./processes/blockchain-monitoring";
import { getLastRestart, setLastRestart } from "./redis";
import logger from "./services/logger";
import { listen } from "./services/sockets";

const server = http.createServer(app);

listen(server);

server.listen(config.port, async () => {
  logger.info(`Start listenning on port : ${config.port}`);

  await setLastRestart();
  const lastRestartTimestamp = await getLastRestart();
  logger.info(
    `Server last restart at : ${lastRestartTimestamp} saved in Redis`
  );

  try {
    pollTransactionsToVerifyAccountStatuses();
  } catch (error) {
    logger.error({
      ...error,
      error:
        "An error occured while trying to pollTransactionsToVerifyAccountStatuses",
    });

    throw error;
  }

  try {
    resumeBlockchainMonitoring();
  } catch (error) {
    logger.error({
      ...error,
      error: "An error occured while trying to resumeBlockchainMonitoring",
    });

    throw error;
  }
});
