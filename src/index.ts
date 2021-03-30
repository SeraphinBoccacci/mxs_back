import { connectToDatabase } from "./services/mongoose";

connectToDatabase();

import http from "http";

import app from "./app";
import config from "./config/config";
import { pollTransactionsToVerifyAccountStatuses } from "./processes/authentication";
import { resumeBlockchainMonitoring } from "./processes/blockchain-monitoring";
import logger from "./services/logger";
import { listen } from "./services/sockets";

const server = http.createServer(app);

listen(server);

server.listen(config.port, () => {
  logger.info(`Start listenning on port : ${config.port}`);

  try {
    pollTransactionsToVerifyAccountStatuses();
  } catch (err) {
    logger.error(
      "An error occured while trying to pollTransactionsToVerifyAccountStatuses",
      { err }
    );

    throw err;
  }

  try {
    resumeBlockchainMonitoring();
  } catch (err) {
    logger.error(
      "An error occured while trying to resumeBlockchainMonitoring",
      {
        err,
      }
    );

    throw err;
  }
});
