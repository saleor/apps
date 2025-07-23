import { NextApiRequest, NextApiResponse } from "next";

import { apl } from "@/lib/saleor-app";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Set appropriate headers
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    // Test data for APL operations
    const testData = {
      saleorApiUrl: "debug-saleor-url",
      token: "debug-token",
      domain: "debug.saleor.test",
      appId: "debug-app-id",
    };

    // Step 2: Attempt to write to APL
    const writeResult = await apl.set(testData);

    // Step 3: Immediately read back the same record
    const readResult = await apl.get("debug-saleor-url");

    // Step 4: Return both results
    return res.status(200).json({
      success: true,
      writeResult,
      readResult,
      testData,
    });
  } catch (error) {
    // Step 5: Catch and log errors with full stack trace
    // eslint-disable-next-line no-console
    console.error("APL debug failed", error);

    // Step 6: Return 500 status with error details
    return res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }
}
