import { metrics } from "@opentelemetry/api";

import pkg from "../../package.json";

export const meter = metrics.getMeter("saleor.app.avatax", pkg.version);
