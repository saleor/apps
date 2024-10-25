import { vi } from "vitest";

vi.stubEnv("DYNAMODB_LOGS_ITEM_TTL_IN_DAYS", "7");
vi.stubEnv("SECRET_KEY", "test_secret_key");

/**
 * Add test setup logic here
 *
 * https://vitest.dev/config/#setupfiles
 */
export {};
