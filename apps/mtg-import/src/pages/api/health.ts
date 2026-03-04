import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";

const DEEP_CHECK_TIMEOUT_MS = 5_000;

/**
 * Health check endpoint for ALB target group health checks.
 *
 * - Shallow (default): Returns 200 OK immediately (liveness probe).
 * - Deep (?deep=true): Pings the database with SELECT 1 (readiness probe).
 *   Returns 503 if the database is unreachable within 5 seconds.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.query.deep !== "true") {
    res.status(200).json({
      status: "healthy",
      service: "mtg-import-app",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  let timeoutId: NodeJS.Timeout | null = null;

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`.finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
      }),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error("Database health check timed out")),
          DEEP_CHECK_TIMEOUT_MS
        );
      }),
    ]);

    res.status(200).json({ status: "ok", checks: { database: "ok" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database unreachable";
    res.status(503).json({ status: "unhealthy", error: message });
  }
}
