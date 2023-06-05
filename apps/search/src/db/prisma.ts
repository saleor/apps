import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
export type Prisma = typeof prisma;

// todo verify if this is enough cleanup
process.on("exit", () => {
  prisma.$disconnect();
});
