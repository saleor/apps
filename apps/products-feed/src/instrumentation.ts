// Use `process.env` here to avoid broken Next.js build

export async function register() {
  if (process.env.OTEL_ENABLED === "true") {
    await import("./instrumentations/otel");
  }
}
