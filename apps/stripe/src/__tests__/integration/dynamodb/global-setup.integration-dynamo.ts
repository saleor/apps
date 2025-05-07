/*
eslint-disable no-console
 */

import "next-test-api-route-handler";

import { execSync } from "node:child_process";
import * as path from "node:path";

import type { TestProject } from "vitest/node";

// eslint-disable-next-line import/no-default-export
export default async function setup(_project: TestProject) {
  const configPath = path.join(__dirname, "./docker-compose.yml");

  // eslint-disable-next-line n/no-process-env
  if (!process.env.CI) {
    execSync(`docker compose -f ${configPath} -p stripe-dynamodb-integration up -d`);

    return async () => {
      console.log("stopping docker compose");
      // looks like it doesn't close the container todo
      execSync(`docker compose -f ${configPath} down`);
    };
  }
}
