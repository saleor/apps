import { PaymentGatewayInitializeSessionEventFragment } from "@/generated/graphql";

import { mockedSaleorAppId } from "../saleor/mocked-saleor-app-id";
import { mockedSourceObject } from "./mocked-source-object";

export const mockedPaymentGatewayInitializeSessionEvent = {
  sourceObject: mockedSourceObject,
  recipient: {
    id: mockedSaleorAppId,
  },
  issuedAt: "2025-07-08T00:00:00Z",
} satisfies PaymentGatewayInitializeSessionEventFragment;
