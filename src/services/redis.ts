import redis from "redis";

export const subscriber = redis.createClient({
  host: "localhost",
  port: 6379,
});

export const publisher = redis.createClient({
  host: "localhost",
  port: 6379,
});

export const redisClient = redis.createClient({
  host: "localhost",
  port: 6379,
});
