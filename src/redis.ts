import logger from "./services/logger";
import { redisClient } from "./services/redis";

export const setLastRestart = async (timestamp?: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const ts = String(timestamp) || (Date.now() * 0.001).toString();

    redisClient.set("LAST_RESTART", ts, (err) => {
      if (!err) {
        resolve(true);
      }

      resolve(false);
    });
  });
};

export const getLastRestart = async (): Promise<number> => {
  return new Promise((resolve) => {
    redisClient.get("LAST_RESTART", (err, data) => {
      if (data) {
        try {
          const restartTimestamp: string = JSON.parse(data);

          resolve(Number(restartTimestamp));
        } catch (error) {
          logger.error("Unparsable Redis data : clear redis", {
            redisData: data,
          });

          resolve(Date.now());
        }
      }

      resolve(Date.now());
    });
  });
};

export const setAlreadyListennedTransactions = async (
  erdAddress: string,
  newListennedTransactionsHashes: string[]
): Promise<boolean> => {
  const listennedTransactions = await getAlreadyListennedTransactions(
    erdAddress
  );

  const last30ListennedTransactions: string[] = [
    ...newListennedTransactionsHashes,
    ...listennedTransactions,
  ].slice(0, 30);

  return new Promise((resolve) => {
    redisClient.set(
      `LISTENNED_TXS_${erdAddress}`,
      JSON.stringify(last30ListennedTransactions),
      (err) => {
        if (!err) {
          resolve(true);
        }

        resolve(false);
      }
    );
  });
};

export const getAlreadyListennedTransactions = (
  erdAddress: string
): Promise<string[]> => {
  return new Promise((resolve) => {
    redisClient.get(`LISTENNED_TXS_${erdAddress}`, (err, data) => {
      if (data) {
        try {
          const alreadyListennedTransactions: string[] = JSON.parse(data);

          resolve(alreadyListennedTransactions);
        } catch (error) {
          logger.error("Unparsable Redis data : clear redis", {
            redisData: data,
          });

          resolve([]);
        }
      }

      resolve([]);
    });
  });
};

export default {
  setAlreadyListennedTransactions,
  getAlreadyListennedTransactions,
};
