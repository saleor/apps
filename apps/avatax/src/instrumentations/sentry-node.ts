import {
  defaultStackParser,
  getCurrentScope,
  getDefaultIntegrationsWithoutPerformance,
  makeNodeTransport,
  NodeClient,
} from "@sentry/nextjs";

import { env } from "@/env";

// We didn't use `Sentry.init` here because it interferes with our OTEL setup and it is causing some spans to be lost. Instead we are using `NodeClient` directly - which is `Sentry.init` doing under the hood.
const nodeClient = new NodeClient({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.ENV,
  // we don't follow OTEL guide from Sentry https://docs.sentry.io/platforms/javascript/guides/nextjs/opentelemetry/custom-setup/ as we use Sentry just for error tracking
  skipOpenTelemetrySetup: true,
  integrations: [...getDefaultIntegrationsWithoutPerformance()],
  transport: makeNodeTransport,
  stackParser: defaultStackParser,
});

getCurrentScope().setClient(nodeClient);

nodeClient.init();
