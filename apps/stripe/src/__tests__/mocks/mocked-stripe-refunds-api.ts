import { vi } from "vitest";

import { IStripeRefundsApi } from "@/modules/stripe/types";

export const mockedStripeRefundsApi = {
  createRefund: vi.fn(),
} satisfies IStripeRefundsApi;
