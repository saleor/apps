import { env } from "./env";

export const isOtelEnabled = env.OTEL_ENABLED === true;
