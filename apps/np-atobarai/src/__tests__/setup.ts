import { vi } from "vitest";

process.env.TZ = "UTC";

vi.stubEnv("SECRET_KEY", "test_secret_key");

export {};
