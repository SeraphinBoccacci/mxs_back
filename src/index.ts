import http from "http";

import app from "./app";
import config from "./config/config";
import { validateAuthenticationDataFromTransaction } from "./processes/authentication";
import { resumeBlockchainMonitoring } from "./processes/blockchain-monitoring";
import logger from "./services/logger";
import { connectToDatabase } from "./services/mongoose";
import { getLastRestart, setLastRestart } from "./services/redis";
import { listen } from "./services/sockets";

connectToDatabase().then(() => {
  const server = http.createServer(app);

  listen(server);

  server.listen(config.port, async () => {
    logger.info("Start listenning on port", { port: config.port });

    await setLastRestart();
    const lastRestartTimestamp = await getLastRestart();
    logger.info("Server last restart timestamp saved in Redis", {
      lastRestartTimestamp,
    });

    try {
      validateAuthenticationDataFromTransaction();
    } catch (error) {
      logger.error(
        "An error occured while trying to validateAuthenticationDataFromTransaction",
        { error }
      );
    }

    try {
      resumeBlockchainMonitoring();
    } catch (error) {
      logger.error(
        "An error occured while trying to resumeBlockchainMonitoring",
        { error }
      );
    }
  });
});
