import { env } from "@/env.js";

export async function register() {
  if (env.NEXT_RUNTIME === "nodejs" && env.OTEL_ENABLED) {
    await import("./instrumentation.node");
  }
}
