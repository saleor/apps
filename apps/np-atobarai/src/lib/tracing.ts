import { trace } from "@opentelemetry/api";

import pkg from "@/package.json";

export const appInternalTracer = trace.getTracer(
  "saleor-app-payment-np-atobarai.core",
  pkg.version,
);
