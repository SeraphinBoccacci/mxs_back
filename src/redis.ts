import logger from "./services/logger";
import { redisClient } from "./services/redis";
import { LastSnapshotBalance } from "./types";

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
            redisData: data,
          });
        }
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
      }

      resolve(false);
    });
  });
};

export default {
  getLastBalanceSnapShot,
  setNewBalance,
};
