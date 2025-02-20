// Use `process.env` here to avoid broken Next.js build

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.OTEL_ENABLED === "true") {
    await import("./otel-instrumentation.node");
  }
}
