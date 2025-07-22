import { vi } from "vitest";

import { IAtobaraiApiClient } from "@/modules/atobarai/api/types";

export const mockedAtobaraiApiClient = {
  registerTransaction: vi.fn(),
  changeTransaction: vi.fn(),
  verifyCredentials: vi.fn(),
  reportFulfillment: vi.fn(),
  cancelTransaction: vi.fn(),
} satisfies IAtobaraiApiClient;
