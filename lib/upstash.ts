import { Redis } from "@upstash/redis";

const UPSTASH_ENDPOINT = process.env.UPSTASH_ENDPOINT as string;
const UPSTASH_TOKEN = process.env.UPSTASH_TOKEN as string;

let cachedDb: Redis;

export async function getRedisClient() {
  if (cachedDb) {
    return cachedDb;
  }

  if (!UPSTASH_ENDPOINT || !UPSTASH_TOKEN) {
    throw new Error(
      "Please define the UPSTASH_ENDPOINT and UPSTASH_TOKEN environment variables inside .env.local"
    );
  }

  const client = new Redis({
    url: UPSTASH_ENDPOINT,
    token: UPSTASH_TOKEN,
  });

  cachedDb = client;

  return client;
}
