import "next-test-api-route-handler";

import { vi } from "vitest";

vi.stubEnv("SECRET_KEY", "test_secret_key");
vi.stubEnv("AWS_REGION", "localhost");
vi.stubEnv("AWS_ACCESS_KEY_ID", "");
vi.stubEnv("AWS_SECRET_ACCESS_KEY", "");
vi.stubEnv("AWS_ENDPOINT_URL", "http://localhost:8000");
vi.stubEnv("DYNAMODB_MAIN_TABLE_NAME", "stripe-main-table");

export {};
