import { vi } from "vitest";

import { type StripeCustomerLinkRepo } from "@/modules/stripe-customers/repositories/stripe-customer-link-repo";

export const mockedStripeCustomerLinkRepo = {
  getCustomerId: vi.fn(),
  saveCustomerId: vi.fn(),
  deleteCustomerId: vi.fn(),
} satisfies StripeCustomerLinkRepo;
