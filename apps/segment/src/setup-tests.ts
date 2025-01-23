import { vi } from "vitest";

vi.stubEnv("SECRET_KEY", "test_secret_key");
vi.stubEnv("DYNAMODB_MAIN_TABLE_NAME", "test-table");
vi.stubEnv("AWS_REGION", "test");
vi.stubEnv("AWS_ACCESS_KEY_ID", "test-id");
vi.stubEnv("AWS_SECRET_ACCESS_KEY", "test-key");

export {};
