import "next-test-api-route-handler";

import { execSync } from "node:child_process";

import { beforeEach, vi } from "vitest";

// eslint-disable-next-line turbo/no-undeclared-env-vars, n/no-process-env
process.env.TZ = "UTC";

vi.stubEnv("SECRET_KEY", "test_secret_key");
vi.stubEnv("AWS_REGION", "localhost");
vi.stubEnv("AWS_ACCESS_KEY_ID", "");
vi.stubEnv("AWS_SECRET_ACCESS_KEY", "");
vi.stubEnv("AWS_ENDPOINT_URL", "http://localhost:8000");
vi.stubEnv("DYNAMODB_MAIN_TABLE_NAME", "stripe-main-table-integration");

// todo extract envs
beforeEach(() => {
  execSync("./src/__tests__/integration/dynamodb/delete-dynamodb-table.sh");
  execSync("./src/__tests__/integration/dynamodb/setup-dynamodb.sh");
});

export {};
