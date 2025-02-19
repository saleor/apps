import { env } from "@/env";

export async function register() {
  console.log("Registering instrumentation");
  if (env.NEXT_RUNTIME === "nodejs" && env.OTEL_ENABLED) {
    await import("./instrumentation.node");
  }
}
