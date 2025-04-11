import { ok } from "neverthrow";
import { vi } from "vitest";

import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";

export const mockedAppConfigRepo: AppConfigRepo = {
  getStripeConfig: async () => ok(mockedStripeConfig),
  saveStripeConfig: vi.fn(),
  updateStripeConfig: vi.fn(),
};
