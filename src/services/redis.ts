import redis from "redis";

export const redisClient = redis.createClient({
  host: "localhost",
  port: 6379,
  password: "lettuce_ping_jonguille_olivier_restaurant",
});
