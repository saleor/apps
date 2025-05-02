import "next-test-api-route-handler";

import { beforeEach, vi } from "vitest";

import { deleteTable } from "./restore-table";
import { createTable } from "./setup-table";

// eslint-disable-next-line turbo/no-undeclared-env-vars, n/no-process-env
process.env.TZ = "UTC";

vi.stubEnv("SECRET_KEY", "test_secret_key");
vi.stubEnv("AWS_REGION", "localhost");
vi.stubEnv("AWS_ACCESS_KEY_ID", "");
vi.stubEnv("AWS_SECRET_ACCESS_KEY", "");
vi.stubEnv("AWS_ENDPOINT_URL", "http://localhost:8000");
vi.stubEnv("DYNAMODB_MAIN_TABLE_NAME", "stripe-main-table-integration");

// todo extract envs
beforeEach(async () => {
  await deleteTable();

  await createTable().catch(() => {
    /*
     * it doesn't actually work - looks like vitest is still isolating processes so it doesn't kill ALL of them
     * todo this probably should be fix for early exist
     */
    process.exit(1);
  });
});

export {};
