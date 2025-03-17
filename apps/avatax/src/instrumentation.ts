/* eslint-disable node/no-process-env */
// Use `process.env` here to avoid broken Next.js build

export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.OTEL_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_SENTRY_DSN
  ) {
    await import("./instrumentations/node");
  }
}
