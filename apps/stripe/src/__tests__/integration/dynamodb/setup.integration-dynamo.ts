import "next-test-api-route-handler";

import { beforeEach, vi } from "vitest";

import { createTable } from "./create-table";
import { deleteTable } from "./delete-table";

process.env.TZ = "UTC";

vi.stubEnv("SECRET_KEY", "test_secret_key");
vi.stubEnv("DYNAMODB_MAIN_TABLE_NAME", "stripe-main-table-integration");

beforeEach(async () => {
  await deleteTable();

  await createTable();
});

export {};
