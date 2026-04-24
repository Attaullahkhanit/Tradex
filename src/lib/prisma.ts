import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import "dotenv/config";

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  const rawDbPath = url.replace("file:", "");
  const dbPath = path.isAbsolute(rawDbPath)
    ? rawDbPath
    : path.join(process.cwd(), rawDbPath);

  console.log("PRISMA_INIT: Connecting to database at:", dbPath);

  try {
    // In Prisma 7, the adapter expects a config object with a 'url' property
    const adapter = new PrismaBetterSqlite3({
      url: url,
      verbose: console.log
    });

    const client = new PrismaClient({
      adapter
    });

    console.log("PRISMA_INIT: Client successfully initialized");
    return client;
  } catch (error) {
    console.error("PRISMA_INIT_ERROR:", error);
    throw error;
  }
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
