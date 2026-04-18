import { PrismaClient } from "@prisma/client";

const g = globalThis as unknown as { _prisma?: PrismaClient };

function db(): PrismaClient {
  if (!g._prisma) {
    g._prisma = new PrismaClient({
      datasources: {
        db: { url: process.env.DATABASE_URL ?? "" },
      },
    });
  }
  return g._prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_t, prop: string | symbol) {
    const client = db();
    const v = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof v === "function" ? (v as (...args: unknown[]) => unknown).bind(client) : v;
  },
});
