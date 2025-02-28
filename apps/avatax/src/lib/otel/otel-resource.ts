import { createResource } from "@saleor/apps-otel/src/resource-factory";

import { env } from "@/env";

import pkg from "../../../package.json";

export const otelResource = createResource({
  serviceName: env.OTEL_SERVICE_NAME,
  serviceVersion: pkg.version,
  serviceEnviroment: env.ENV,
  serviceCommitSha: env.VERCEL_GIT_COMMIT_SHA,
});
