import * as Sentry from "@sentry/nextjs";

export const setSentrySaleorUser = (saleorApiUrl: string) => {
  try {
    const host = new URL(saleorApiUrl).host;

    if (!host) {
      return;
    }

    Sentry.setUser({ id: host });
  } catch {
    // Invalid or non-absolute URL; do not set Sentry user
  }
};
