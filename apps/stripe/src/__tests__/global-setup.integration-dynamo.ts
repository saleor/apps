import "next-test-api-route-handler";

import { execSync } from "node:child_process";

import type { TestProject } from "vitest/node";

// eslint-disable-next-line import/no-default-export
export default function setup(project: TestProject) {
  // todo make it docker-compose for easier declarative config, volumes etc, otherwise we have conflict with run and start
  execSync("docker run --name stripe_integration_test_local -p 8000:8000 amazon/dynamodb-local");
  // todo make it configurable, or maybe use docker-compose?
  execSync("./scripts/setup-dynamodb.sh");

  // todo clean data on every test

  return () => {
    execSync("docker container stop stripe_integration_test_local");
  };
}
