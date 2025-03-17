import { ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from "@opentelemetry/semantic-conventions/incubating";
import { createAwsInstrumentation } from "@saleor/apps-otel/src/aws-instrumentation-factory";
import { createBatchSpanProcessor } from "@saleor/apps-otel/src/batch-span-processor-factory";
import { createHttpInstrumentation } from "@saleor/apps-otel/src/http-instrumentation-factory";
import * as Sentry from "@sentry/nextjs";
import { SentryPropagator, SentrySampler } from "@sentry/opentelemetry";
import { registerOTel } from "@vercel/otel";

import { env } from "@/env";

import pkg from "../../package.json";

const sentryClient = Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.ENV,
  includeLocalVariables: true,
  skipOpenTelemetrySetup: true,
  registerEsmLoaderHooks: false,
  integrations: [
    Sentry.localVariablesIntegration({
      captureAllExceptions: true,
    }),
    Sentry.extraErrorDataIntegration(),
    Sentry.httpIntegration({ spans: false }),
  ],
  tracesSampleRate: 1.0,
});

registerOTel({
  serviceName: env.OTEL_SERVICE_NAME,
  attributes: {
    [ATTR_SERVICE_VERSION]: pkg.version,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env.ENV,
    "commit-sha": env.VERCEL_GIT_COMMIT_SHA,
    // override attribute set by `@vercel/otel` - if you are using OSS version you can remove it
    env: undefined,
    "vercel.env": env.VERCEL_ENV,
  },
  spanProcessors: [
    createBatchSpanProcessor({
      accessToken: env.OTEL_ACCESS_TOKEN,
    }),
  ],
  instrumentations: [createAwsInstrumentation(), createHttpInstrumentation()],
  traceSampler: sentryClient ? new SentrySampler(sentryClient) : undefined,
  propagators: [new SentryPropagator()],
  contextManager: new Sentry.SentryContextManager(),
});
