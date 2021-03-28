import logger from "./services/logger";
import { redisClient } from "./services/redis";

export const setAlreadyListennedTransactions = async (
  erdAddress: string,
  newListennedTransactionsHashes: string[]
): Promise<boolean> => {
  const listennedTransactions = await getAlreadyListennedTransactions(
    erdAddress
  );

  const last30ListennedTransactions = [
    ...newListennedTransactionsHashes,
    listennedTransactions,
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
