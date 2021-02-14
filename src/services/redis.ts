import redis from "redis";

export const subscriber = redis.createClient({
  host: "localhost",
  port: 6379,
  password: "lettuce_ping_jonguille_olivier_restaurant",
});

export const publisher = redis.createClient({
  host: "localhost",
  port: 6379,
  password: "lettuce_ping_jonguille_olivier_restaurant",
});

export const redisClient = redis.createClient({
  host: "localhost",
  port: 6379,
  password: "lettuce_ping_jonguille_olivier_restaurant",
});
