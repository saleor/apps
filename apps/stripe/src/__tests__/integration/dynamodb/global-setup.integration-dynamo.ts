/*
eslint-disable no-console
 */

import "next-test-api-route-handler";

import { execSync } from "node:child_process";
import * as path from "node:path";

import type { TestProject } from "vitest/node";

// eslint-disable-next-line import/no-default-export
export default function setup(_project: TestProject) {
  const configPath = path.join(__dirname, "./docker-compose.yml");

  execSync(`docker compose -f ${configPath} -p stripe-dynamodb-integration up -d`);

  return () => {
    console.log("stopping docker compose");
    // looks like it doesn't close the container todo
    execSync(`docker compose -f ${configPath} down`);
  };
}
