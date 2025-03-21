import {
  defaultStackParser,
  getCurrentScope,
  getDefaultIntegrationsWithoutPerformance,
  makeNodeTransport,
  NodeClient,
} from "@sentry/nextjs";

import { env } from "@/env";

const nodeClient = new NodeClient({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.ENV,
  skipOpenTelemetrySetup: true,
  integrations: [...getDefaultIntegrationsWithoutPerformance()],
  transport: makeNodeTransport,
  stackParser: defaultStackParser,
});

getCurrentScope().setClient(nodeClient);

nodeClient.init();
