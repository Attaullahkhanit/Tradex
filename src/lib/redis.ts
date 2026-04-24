import Redis from "ioredis";

const redisClientSingleton = () => {
  if (!process.env.REDIS_URL) {
    console.warn("REDIS_URL is not defined. Redis caching will be disabled.");
    return null;
  }
  return new Redis(process.env.REDIS_URL);
};

declare const globalThis: {
  redisGlobal: ReturnType<typeof redisClientSingleton> | undefined;
} & typeof global;

const redis = globalThis.redisGlobal ?? redisClientSingleton();

export default redis;

if (process.env.NODE_ENV !== "production") globalThis.redisGlobal = redis;

// Caching Helpers
export async function setCache(key: string, value: unknown, ttlInSeconds = 3600) {
  if (!redis) return;
  try {
    const stringValue = JSON.stringify(value);
    await redis.set(key, stringValue, "EX", ttlInSeconds);
  } catch (error) {
    console.error("Redis Set Error:", error);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    console.error("Redis Get Error:", error);
    return null;
  }
}

export async function delCache(key: string) {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Redis Delete Error:", error);
  }
}
