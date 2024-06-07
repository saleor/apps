export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // @ts-expect-error - TypeScript is not aware of this dynamic import - it is working properly on dev and build
    await import("@saleor/sentry-utils/node/instrumentation");
  }
}
