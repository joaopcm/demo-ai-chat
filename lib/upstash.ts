import { Redis } from "@upstash/redis";

let cachedDb: Redis;

export async function getRedisClient() {
  if (cachedDb) {
    return cachedDb;
  }

  if (!process.env.UPSTASH_ENDPOINT || !process.env.UPSTASH_TOKEN) {
    throw new Error(
      "Please define the UPSTASH_ENDPOINT and UPSTASH_TOKEN environment variables inside .env.local"
    );
  }

  const client = new Redis({
    url: process.env.UPSTASH_ENDPOINT,
    token: process.env.UPSTASH_TOKEN,
  });

  cachedDb = client;

  return client;
}
