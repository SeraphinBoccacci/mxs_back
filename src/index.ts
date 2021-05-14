import http from "http";

import app from "./app";
import config from "./config/config";
import { validateAuthenticationDataFromTransaction } from "./processes/authentication";
import { resumeBlockchainMonitoring } from "./processes/blockchain-monitoring";
import { getLastRestart, setLastRestart } from "./redis";
import logger from "./services/logger";
import { connectToDatabase } from "./services/mongoose";
import { listen } from "./services/sockets";

connectToDatabase().then(() => {
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
      validateAuthenticationDataFromTransaction();
    } catch (error) {
      logger.error({
        ...error,
        error:
          "An error occured while trying to validateAuthenticationDataFromTransaction",
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
});
