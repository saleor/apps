import { AvataxClient } from "@/modules/avatax/avatax-client";
import { AvataxConfig } from "@/modules/avatax/avatax-connection-schema";
import { AvataxSdkClientFactory } from "@/modules/avatax/avatax-sdk-client-factory";
import { AvataxOrderCancelledAdapter } from "@/modules/avatax/order-cancelled/avatax-order-cancelled-adapter";
import { AvataxOrderCancelledPayloadTransformer } from "@/modules/avatax/order-cancelled/avatax-order-cancelled-payload-transformer";

export const createAvaTaxOrderCancelledAdapterFromConfig = (avataxConfig: AvataxConfig) => {
  const avaTaxSdk = new AvataxSdkClientFactory().createClient(avataxConfig);
  const avaTaxClient = new AvataxClient(avaTaxSdk);

  const avataxOrderCancelledPayloadTransformer = new AvataxOrderCancelledPayloadTransformer();

  return new AvataxOrderCancelledAdapter(avaTaxClient, avataxOrderCancelledPayloadTransformer);
};
