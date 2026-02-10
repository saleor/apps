import { vi } from "vitest";

import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo-impl";

export const mockedAppConfigRepo = {
  getChannelConfig: vi.fn(),
  saveChannelConfig: vi.fn(),
  getRootConfig: vi.fn(),
  updateMapping: vi.fn(),
  removeConfig: vi.fn(),
} satisfies AppConfigRepo;
