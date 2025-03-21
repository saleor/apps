/* eslint-disable max-params */
import { ParentBasedSampler, TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from "@opentelemetry/semantic-conventions/incubating";
import { createAwsInstrumentation } from "@saleor/apps-otel/src/aws-instrumentation-factory";
import { createBatchSpanProcessor } from "@saleor/apps-otel/src/batch-span-processor-factory";
import { createHttpInstrumentation } from "@saleor/apps-otel/src/http-instrumentation-factory";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import * as Sentry from "@sentry/nextjs";
import { SentryPropagator, wrapSamplingDecision } from "@sentry/opentelemetry";
import { registerOTel } from "@vercel/otel";

import { env } from "@/env";

import { Context, Link, SpanAttributes, SpanKind } from "@opentelemetry/api";
import pkg from "../../package.json";

class AppSampler extends ParentBasedSampler {
  shouldSample(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: SpanAttributes,
    links: Link[],
  ) {
    const { decision } = super.shouldSample(
      context,
      traceId,
      spanName,
      spanKind,
      attributes,
      links,
    );

    console.log("AppSampler.shouldSample.decision", { decision });

    return wrapSamplingDecision({
      decision,
      context,
      spanAttributes: attributes,
    });
  }
  toString() {
    return "AppSampler";
  }
}

Sentry.init({
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
});

registerOTel({
  serviceName: env.OTEL_SERVICE_NAME,
  attributes: {
    [ATTR_SERVICE_VERSION]: pkg.version,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env.ENV,
    [ObservabilityAttributes.COMMIT_SHA]: env.VERCEL_GIT_COMMIT_SHA,
    [ObservabilityAttributes.REPOSITORY_URL]: env.REPOSITORY_URL,
    // override attribute set by `@vercel/otel` - if you are using OSS version you can remove it
    env: undefined,
    [ObservabilityAttributes.VERCEL_ENV]: env.VERCEL_ENV,
  },
  spanProcessors: [
    createBatchSpanProcessor({
      accessToken: env.OTEL_ACCESS_TOKEN,
    }),
  ],
  instrumentations: [createAwsInstrumentation(), createHttpInstrumentation()],
  traceSampler: new AppSampler({
    root: new TraceIdRatioBasedSampler(env.OTEL_TRACES_SAMPLER_ARG),
  }),
  propagators: [new SentryPropagator()],
  contextManager: new Sentry.SentryContextManager(),
});
