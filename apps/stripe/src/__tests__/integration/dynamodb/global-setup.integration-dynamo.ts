import "next-test-api-route-handler";

import { execSync } from "node:child_process";
import * as path from "node:path";

import type { TestProject } from "vitest/node";

// eslint-disable-next-line import/no-default-export
export default function setup(project: TestProject) {
  const configPath = path.join(__dirname, "./docker-compose.yml");

  execSync(`docker compose -f ${configPath} -p stripe-dynamodb-integration up -d`);

  return () => {
    execSync("docker compose down");
  };
}
