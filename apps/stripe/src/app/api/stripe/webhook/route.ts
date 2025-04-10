import { NextRequest, NextResponse } from "next/server";

import { StripeWebhookUseCase } from "@/app/api/stripe/webhook/use-case";
import { appConfigPersistence } from "@/lib/app-config-persistence";
import { withLoggerContext } from "@/lib/logger-context";

const useCase = new StripeWebhookUseCase({
  appConfigRepo: appConfigPersistence,
});

const handler = async (request: NextRequest): Promise<NextResponse> => {
  const result = await useCase.execute();

  // todo handle usecase errors

  // TODO: Check what to respond
  return new Response("OK", {
    status: 200,
  });
};

/**
 * todo:
 * - wrap with middleware that will attach OTEL attributes from headers
 * - integration test
 */
export const POST = withLoggerContext(handler);
