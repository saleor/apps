import { trace } from "@opentelemetry/api";

import pkg from "../../../package.json";

export const appRootTracer = trace.getTracer("saleor.app.cms", pkg.version);
