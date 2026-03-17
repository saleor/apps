import { setUser } from "@sentry/nextjs";

export const setSentrySaleorUser = (saleorApiUrl: string) => {
  const host = new URL(saleorApiUrl).host;

  setUser({ id: host });
};
