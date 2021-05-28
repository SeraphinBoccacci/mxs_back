import redis from "redis";

import logger from "../services/logger";
import { LastSnapshotBalance } from "../types/elrond";
import { ENV } from "../utils/env";

const createRedisClient = () => {
  return redis.createClient({
    host: `${ENV.REDIS_HOST}`,
    port: parseInt(`${ENV.REDIS_PORT}`),
  });
};

const redisClient = createRedisClient();
export const subscriber = createRedisClient();
export const publisher = createRedisClient();

export const getLastBalanceSnapShot = (
  erdAddress: string
): Promise<LastSnapshotBalance | null> => {
  return new Promise((resolve) => {
    redisClient.get(`BALANCE_${erdAddress}`, (err, data) => {
      if (data) {
        try {
          const lastBalanceSnapShot: LastSnapshotBalance = JSON.parse(data);

          resolve(lastBalanceSnapShot);
        } catch (error) {
          logger.error("Unparsable Redis data : clear redis", {
            ...error,
            redisData: data,
          });
        }

        return;
      }

      resolve(null);
    });
  });
};

export const setNewBalance = (
  erdAddress: string,
  newBalance: string
): Promise<boolean> => {
  const balance: LastSnapshotBalance = {
    amount: newBalance,
    timestamp: Math.ceil(Date.now() * 0.001),
  };

  return new Promise((resolve) => {
    redisClient.set(`BALANCE_${erdAddress}`, JSON.stringify(balance), (err) => {
      if (!err) {
        resolve(true);

        return;
      }

      logger.error(err);
      resolve(false);
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

  const last30ListennedTransactions = [
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

          return;
        }

        logger.error(err);
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
            ...error,
            redisData: data,
          });
          resolve([]);
        }

        return;
      }

      resolve([]);
    });
  });
};

export const setLastRestart = async (
  timestamp: number = Math.ceil(Date.now() * 0.001)
): Promise<boolean> => {
  return new Promise((resolve) => {
    const ts = String(timestamp);

    redisClient.set("LAST_RESTART", ts, (err) => {
      if (!err) {
        resolve(true);

        return;
      }

      logger.error(err);
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
            ...error,
            redisData: data,
          });

          resolve(Date.now());
        }

        return;
      }

      resolve(Date.now());
    });
  });
};

export default {
  getLastBalanceSnapShot,
  setNewBalance,
};
