import { trace } from "@opentelemetry/api";

import pkg from "../../../package.json";

export const internalTracer = trace.getTracer("saleor.app.avatax.core", pkg.version);

export const externalTracer = trace.getTracer("saleor.app.avatax.service", pkg.version);
