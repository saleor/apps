import { PrismaClient } from "@/generated/prisma";

import { env } from "./env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}connection_limit=5`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasourceUrl: getDatasourceUrl(),
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type { PrismaClient };
