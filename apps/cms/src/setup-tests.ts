import { vi } from "vitest";

vi.stubEnv("SECRET_KEY", "TEST");
vi.stubEnv("DYNAMODB_MAIN_TABLE_NAME", "test-table");
vi.stubEnv("AWS_REGION", "us-east-1");
vi.stubEnv("AWS_ACCESS_KEY_ID", "test-access-key");
vi.stubEnv("AWS_SECRET_ACCESS_KEY", "test-secret-key");
