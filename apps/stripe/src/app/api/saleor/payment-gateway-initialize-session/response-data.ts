import { z } from "zod";

export const responseData = z
  .object({
    stripePublishableKey: z.string(),
  })
  .brand("PaymentGatewayInitializeSessionResponseData");

export type ResponseDataType = z.infer<typeof responseData>;
