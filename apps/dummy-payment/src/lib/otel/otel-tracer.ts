import { trace } from "@opentelemetry/api";

const ROOT_TRACE_NAME = "app-api-handler";

export const getOtelTracer = () => trace.getTracer(ROOT_TRACE_NAME);
