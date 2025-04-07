import "next-test-api-route-handler";

import { vi } from "vitest";

vi.stubEnv("SECRET_KEY", "test_secret_key");

export {};
