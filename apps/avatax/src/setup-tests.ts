import { vi } from "vitest";

vi.stubEnv("DYNAMODB_LOGS_ITEM_TTL_IN_DAYS", "7");

/**
 * Add test setup logic here
 *
 * https://vitest.dev/config/#setupfiles
 */
export {};
