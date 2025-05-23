import "next-test-api-route-handler";

import { beforeEach } from "vitest";

import { createTable } from "./create-table";
import { deleteTable } from "./delete-table";

// eslint-disable-next-line turbo/no-undeclared-env-vars, n/no-process-env
process.env.TZ = "UTC";

// eslint-disable-next-line n/no-process-env
const TABLE_NAME = process.env.DYNAMODB_MAIN_TABLE_NAME as string;

beforeEach(async () => {
  await deleteTable();

  await createTable(TABLE_NAME);
});

export {};
