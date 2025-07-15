import { GenericRepo } from "@saleor/dynamo-config-repository";
import { vi } from "vitest";

import { AppChannelConfig } from "@/modules/app-config/app-config";

export const mockedAppConfigRepo = {
  getChannelConfig: vi.fn(),
  getRootConfig: vi.fn(),
  removeConfig: vi.fn(),
  saveChannelConfig: vi.fn(),
  updateMapping: vi.fn(),
} satisfies GenericRepo<AppChannelConfig>;
