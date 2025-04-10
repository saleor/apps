import { NextRequest } from "next/server";

import { getAndParseStripeSignatureHeader } from "@/app/api/stripe/webhook/stripe-signature-header";
import { StripeWebhookUseCase } from "@/app/api/stripe/webhook/use-case";
import { appConfigPersistence } from "@/lib/app-config-persistence";
import { withLoggerContext } from "@/lib/logger-context";

const useCase = new StripeWebhookUseCase({
  appConfigRepo: appConfigPersistence,
});

const handler = async (request: NextRequest): Promise<Response> => {
  const stripeSignatureHeader = getAndParseStripeSignatureHeader(request.headers);

  if (stripeSignatureHeader.isErr()) {
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const result = await useCase.execute({
    rawBody: await request.text(),
    signatureHeader: stripeSignatureHeader.value,
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
