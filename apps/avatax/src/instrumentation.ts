export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // @ts-expect-error
    await import("@saleor/sentry-utils/node/instrumentation");
  }
}
