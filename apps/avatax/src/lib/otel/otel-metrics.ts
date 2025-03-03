import { metrics } from "@opentelemetry/api";

import pkg from "../../../package.json";

export const internalMeter = metrics.getMeter("saleor.app.avatax.core", pkg.version);

export const externalMeter = metrics.getMeter("saleor.app.avatax.service", pkg.version);
