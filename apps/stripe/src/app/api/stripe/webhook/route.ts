import { Result } from "neverthrow";
import { NextRequest } from "next/server";

import { getAndParseStripeSignatureHeader } from "@/app/api/stripe/webhook/stripe-signature-header";
import { StripeWebhookEventParser } from "@/app/api/stripe/webhook/stripe-webhook-event-parser";
import { StripeWebhookUseCase } from "@/app/api/stripe/webhook/use-case";
import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";
import { appConfigPersistence } from "@/lib/app-config-persistence";
import { withLoggerContext } from "@/lib/logger-context";

const useCase = new StripeWebhookUseCase({
  appConfigRepo: appConfigPersistence,
  webhookEventParser: new StripeWebhookEventParser(),
});

const handler = async (request: NextRequest): Promise<Response> => {
  const requiredUrlAttributes = Result.combine([
    getAndParseStripeSignatureHeader(request.headers),
    WebhookParams.createFromWebhookUrl(request.url),
  ]);

  if (requiredUrlAttributes.isErr()) {
    /**
     * Has access to first error value
     * Use https://github.com/supermacro/neverthrow#resultcombinewithallerrors-static-class-method to
     * get access to all errors
     */
    return new Response(`Invalid request: ${requiredUrlAttributes.error.message}`, {
      status: 400,
    });
  }

  const [stripeSignatureHeader, webhookParams] = requiredUrlAttributes.value;

  const result = await useCase.execute({
    rawBody: await request.text(),
    signatureHeader: stripeSignatureHeader,
    webhookParams,
  });

  return result.match(
    (success) => {
      return success.getResponse();
    },
    (error) => {
      return error.getResponse();
    },
  );
};

/**
 * todo:
 * - wrap with middleware that will attach OTEL attributes from headers
 * - integration test
 */
export const POST = withLoggerContext(handler);
