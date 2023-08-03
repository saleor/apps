import { prisma } from "./db/prisma";

export const register = async () => {
  if (process.env.RUN_WORKER_IN_NEXT_PROCESS === "true" && process.env.NEXT_RUNTIME === "nodejs") {
    console.log("RUN_WORKER_IN_NEXT_PROCESS env is set, will inject worker to Next.js process");

    /**
     * Next does not refresh this file, so it will be hard to develop
     */
    await import("./worker/runner").catch();
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./otel.ts");

    prisma.$connect().catch((e: any) => {
      console.error(e);
      console.error("Cant connect to database, will exit");
      process.exit(1);
    });
  }
};
