import { trace } from "@opentelemetry/api";

export const appRootTracer = trace.getTracer("saleor-app-segment");
