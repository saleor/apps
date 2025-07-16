import { vi } from "vitest";

import { AppConfigRepo } from "@/modules/app-config/repo/app-config-repo";

export const mockedAppConfigRepo = {
  getChannelConfig: vi.fn(),
  getRootConfig: vi.fn(),
  removeConfig: vi.fn(),
  saveChannelConfig: vi.fn(),
  updateMapping: vi.fn(),
} satisfies AppConfigRepo;
