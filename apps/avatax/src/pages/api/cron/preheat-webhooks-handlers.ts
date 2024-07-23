import { BaseError } from "@/error";
import { createLogger } from "@/logger";
import { withOtel } from "@saleor/apps-otel";
import { ResultAsync } from "neverthrow";
import { NextApiRequest, NextApiResponse } from "next";

const PreheatCheckoutCalculateTaxesError = BaseError.subclass("PreheatCheckoutCalculateTaxesError");
const preheatOrderCalculateTaxesError = BaseError.subclass("PreheatOrderCalculateTaxesError");

const logger = createLogger("preheatWebhookHandlersCron");

const getBaseUrl = () =>
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

const preheatCheckoutCalculateTaxes = () =>
  ResultAsync.fromPromise(
    fetch(`${getBaseUrl()}/api/webhooks/checkout-calculate-taxes`, {
      method: "POST",
      headers: {
        "saleor-api-url": "https://mocked-cron.saleor.io/graphql/",
        "saleor-event": "checkout_calculate_taxes",
        "saleor-signature": "mocked-signature",
      },
      body: JSON.stringify({}),
    }).then(async (reponse) => ({
      body: await reponse.json(),
      status: reponse.status,
      handler: "checkout-calculate-taxes",
    })),
    (err) => PreheatCheckoutCalculateTaxesError.normalize(err),
  );

const preheatOrderCalculateTaxes = () =>
  ResultAsync.fromPromise(
    fetch(`${getBaseUrl()}/api/webhooks/order-calculate-taxes`, {
      method: "POST",
      headers: {
        "saleor-api-url": "https://mocked-cron.saleor.io/graphql/",
        "saleor-event": "order_calculate_taxes",
        "saleor-signature": "mocked-signature",
      },
      body: JSON.stringify({}),
    }).then(async (reponse) => ({
      body: await reponse.json(),
      status: reponse.status,
      handler: "order-calculate-taxes",
    })),
    (err) => preheatOrderCalculateTaxesError.normalize(err),
  );

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const authHeader = request.headers["authorization"] as string;

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    logger.error("Unauthorized request to preheat webhook handlers");

    return response.status(401).json({ success: false });
  }

  logger.info("Preheating webhook handlers");

  await ResultAsync.combine([preheatCheckoutCalculateTaxes(), preheatOrderCalculateTaxes()])
    .map((results) => {
      results.map((result) => {
        logger.info(`Preheated ${result.handler} webhook handler`, {
          response: result.status,
          body: result.body,
        });
      });
    })
    .mapErr((err) => {
      logger.error(`Failed to preheat webhook handler`, {
        error: err,
      });
      return response.status(500).json({ success: false });
    });

  logger.info("Preheating webhook handlers extecuted successfully");

  return response.status(200).json({ success: true });
}

export default withOtel(handler, "/api/cron/preheat-webhooks-handlers");
