import "@testing-library/jest-dom/vitest";

import { vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    SECRET_KEY: "test-secret-key",
    DYNAMODB_MAIN_TABLE_NAME: "test-table",
    AWS_REGION: "us-east-1",
    MANIFEST_APP_ID: "saleor.app.shopify-sync",
    APP_NAME: "Shopify Sync",
    APL: "file",
  },
}));

vi.mock("@/lib/logger", () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));
