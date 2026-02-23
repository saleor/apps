import { vi } from "vitest";

import { type IStripeRefundsApi } from "@/modules/stripe/types";

export const mockedStripeRefundsApi = {
  createRefund: vi.fn(),
} satisfies IStripeRefundsApi;
