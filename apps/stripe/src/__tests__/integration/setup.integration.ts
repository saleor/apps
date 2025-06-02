import "next-test-api-route-handler";

import { beforeEach } from "vitest";

import { createTable } from "./create-table";
import { deleteTable } from "./delete-table";
import { env } from "./env";

process.env.TZ = "UTC";

const TABLE_NAME = env.DYNAMODB_MAIN_TABLE_NAME;

beforeEach(async () => {
  await deleteTable(TABLE_NAME);

  await createTable(TABLE_NAME);
});

export {};
