import { LoggerContext } from "@saleor/apps-logger/node";

export const loggerContext = new LoggerContext();

export const OBSERVABILITY_ATTRIBUTES = {
  API_URL: "apiUrl",
  SALEOR_VERSION: "saleorVersion",
};
