import { trace } from "@opentelemetry/api";

import pkg from "@/package.json";

export const appInternalTracer = trace.getTracer("saleor.app.payment.stripe.core", pkg.version);
