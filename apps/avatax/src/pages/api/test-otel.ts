import { withOtel } from "@saleor/apps-otel";

import { BaseError } from "@/error";
import { createLogger } from "@/logger";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("checkoutCalculateTaxesSyncWebhook");

export default withOtel((req, res) => {
  const TestError = BaseError.subclass("TestError");

  const testError = new TestError("Test error", {
    errors: [new BaseError("Test error 1"), new BaseError("Test error 2")],
    // cause: new BaseError("Test error cause"),
  });

  logger.info("Returning fallback customer code.", {
    error: testError,
  });

  return res.status(200).json({ success: true });
}, "/api/test-otel");
