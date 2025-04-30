import { vi } from "vitest";

import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";

export const mockedAppConfigRepo = {
  getStripeConfig: vi.fn(),
  saveStripeConfig: vi.fn(),
  getRootConfig: vi.fn(),
  updateMapping: vi.fn(),
  removeConfig: vi.fn(),
} satisfies AppConfigRepo;
