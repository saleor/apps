import { vi } from "vitest";

import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { SimpleGraphqlClient } from "../metadata-manager";

export const mockMetadataManager = {
  set: vi.fn().mockImplementation(async () => {}),
  get: vi.fn().mockImplementation(async () => {}),
  delete: vi.fn().mockImplementation(async () => {}),
};

export const createSettingsManager = (client: SimpleGraphqlClient): SettingsManager => {
  return mockMetadataManager;
};
