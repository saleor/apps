#!/usr/bin/env zx

import { $ } from "zx";

const TABLE_NAME = process.env.INTEGRATION_DYNAMO_TABLE_NAME ?? "stripe-main-table-integration";
// const AWS_REGION = process.env.INTEGRATION_DYNAMO_REGION ?? "localhost";
const ENDPOINT_URL = process.env.INTEGRATION_DYNAMO_ENDPOINT ?? "http://localhost:8000";

export const deleteTable = async () => {
  try {
    console.log("dropping table");

    await $`aws dynamodb delete-table --table-name ${TABLE_NAME} --endpoint-url ${ENDPOINT_URL}`;

    console.log("success: table deleted");
  } catch (e) {
    console.log("error deleting, it may exist already");
  }
};
