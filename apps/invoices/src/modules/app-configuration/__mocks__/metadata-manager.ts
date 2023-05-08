import { vi } from "vitest";

import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { SimpleGraphqlClient } from "../metadata-manager";

export const createSettingsManager = (client: SimpleGraphqlClient): SettingsManager => {
  return {
    set: vi.fn(),
    get: vi.fn(),
  };
};
