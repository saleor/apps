/*
  eslint-disable no-console, n/no-process-env
*/

import { $ } from "zx";

const TABLE_NAME = process.env.INTEGRATION_DYNAMO_TABLE_NAME ?? "stripe-main-table-integration";
const AWS_REGION = process.env.INTEGRATION_DYNAMO_REGION ?? "localhost";
const ENDPOINT_URL = process.env.INTEGRATION_DYNAMO_ENDPOINT ?? "http://localhost:8000";

export const createTable = async () => {
  console.log("Creating table");

  try {
    await $`aws dynamodb create-table --table-name ${TABLE_NAME} --attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --endpoint-url ${ENDPOINT_URL} --region ${AWS_REGION}`;

    console.log("Table created");
    // todo stop printing aws output in case of success
  } catch {
    console.error("Error creating table");
    throw new Error("Failed to create table");
  }
};
