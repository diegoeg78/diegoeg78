import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const PrismaClientCtor = PrismaClient as unknown as new () => PrismaClient;

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClientCtor();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
