import { vi } from "vitest";

import { type IStripeCustomersApi } from "@/modules/stripe/types";

export const mockedStripeCustomersApi = {
  createCustomer: vi.fn(),
  hasCustomersWritePermission: vi.fn(),
} satisfies IStripeCustomersApi;
