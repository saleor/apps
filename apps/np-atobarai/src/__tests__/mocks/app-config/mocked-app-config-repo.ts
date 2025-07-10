import { vi } from "vitest";

import { AppConfigRepo } from "@/modules/app-config/types";

export const mockedAppConfigRepo = {
  getAtobaraiConfig: vi.fn(),
} satisfies AppConfigRepo;
