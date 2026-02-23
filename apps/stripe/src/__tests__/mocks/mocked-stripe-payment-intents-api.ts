import { vi } from "vitest";

import { type IStripePaymentIntentsApi } from "@/modules/stripe/types";

export const mockedStripePaymentIntentsApi = {
  createPaymentIntent: vi.fn(),
  getPaymentIntent: vi.fn(),
  capturePaymentIntent: vi.fn(),
  cancelPaymentIntent: vi.fn(),
} satisfies IStripePaymentIntentsApi;
