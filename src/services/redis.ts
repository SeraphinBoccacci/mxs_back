import redis from "redis";

import { ENV } from "../utils/env";

const createRedisClient = () => {
  return redis.createClient({
    host: `${ENV.REDIS_HOST}`,
    port: parseInt(`${ENV.REDIS_PORT}`),
  });
}

export const subscriber = createRedisClient();
export const publisher = createRedisClient();
export const redisClient = createRedisClient();
