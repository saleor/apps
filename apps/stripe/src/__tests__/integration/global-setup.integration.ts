/*
eslint-disable no-console
 */

import "next-test-api-route-handler";

import { execSync } from "node:child_process";
import * as path from "node:path";

import type { TestProject } from "vitest/node";

const wait = () => new Promise((resolve) => setTimeout(resolve, 1000));

// eslint-disable-next-line import/no-default-export
export default async function setup(_project: TestProject) {
  const configPath = path.join(__dirname, "./docker-compose.yml");

  // eslint-disable-next-line n/no-process-env
  if (!process.env.CI) {
    execSync(`docker compose -f ${configPath} -p stripe-dynamodb-integration up -d`);

    /*
     * Dirty way to make a container ready. There should be a better way.
     * Alternatively, allow just creating DB outside of the global setup
     */
    await wait();

    return async () => {
      console.log("stopping docker compose");
      execSync(`docker compose -p stripe-dynamodb-integration down`);
    };
  }
}
