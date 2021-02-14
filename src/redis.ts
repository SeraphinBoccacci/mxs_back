import { IftttConfig, LastSnapshotBalance } from "./interfaces";
import { redisClient } from "./services/redis";

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
          console.log("Balance on redis unparsable : clear REDIS !");
        }
      }

      resolve(null);
    });
  });
};

export const setNewBalance = (
  erdAddress: string,
  balance: LastSnapshotBalance
): Promise<boolean> => {
  return new Promise((resolve) => {
    redisClient.set(
      `BALANCE_${erdAddress}`,
      JSON.stringify(balance),
      (err, res) => {
        if (!err) {
          resolve(true);
        }

        resolve(false);
      }
    );
  });
};

export const getStreamerIFTTTConfig = (
  erdAddress: string
): Promise<IftttConfig | null> => {
  return new Promise((resolve) => {
    redisClient.get(`BALANCE_${erdAddress}`, (err, res) => {
      if (res) {
        const config = JSON.parse(res);

        return config;
      }

      resolve(null);
    });
  });
};
