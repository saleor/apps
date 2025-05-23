import { ok } from "neverthrow";
import { beforeEach, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";

process.env.TZ = "UTC";

vi.stubEnv("SECRET_KEY", "test_secret_key");
vi.stubEnv("AWS_REGION", "localhost");
vi.stubEnv("AWS_ACCESS_KEY_ID", "");
vi.stubEnv("AWS_SECRET_ACCESS_KEY", "");
vi.stubEnv("AWS_ENDPOINT_URL", "http://localhost:8000");
vi.stubEnv("DYNAMODB_MAIN_TABLE_NAME", "stripe-main-table");

beforeEach(() => {
  mockedAppConfigRepo.getStripeConfig.mockImplementation(async () => ok(mockedStripeConfig));
});

export {};
