export async function register() {
  // eslint-disable-next-line node/no-process-env
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.OTEL_ENABLED === "true") {
    await import("./otel-instrumentation.node");
  }
}
