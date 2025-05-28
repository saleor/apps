import "next-test-api-route-handler";

import { beforeEach } from "vitest";

import { createTable } from "./create-table";
import { deleteTable } from "./delete-table";

process.env.TZ = "UTC";

const TABLE_NAME = process.env.DYNAMODB_MAIN_TABLE_NAME as string;

beforeEach(async () => {
  await deleteTable(TABLE_NAME);

  await createTable(TABLE_NAME);
});

export {};
