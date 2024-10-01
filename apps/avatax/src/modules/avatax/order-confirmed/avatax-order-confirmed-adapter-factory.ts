import { AvataxCalculationDateResolver } from "@/modules/avatax/avatax-calculation-date-resolver";
import { AvataxClient } from "@/modules/avatax/avatax-client";
import { AvataxConfig } from "@/modules/avatax/avatax-connection-schema";
import { AvataxDocumentCodeResolver } from "@/modules/avatax/avatax-document-code-resolver";
import { AvataxEntityTypeMatcher } from "@/modules/avatax/avatax-entity-type-matcher";
import { AvataxSdkClientFactory } from "@/modules/avatax/avatax-sdk-client-factory";
import { AvataxOrderConfirmedAdapter } from "@/modules/avatax/order-confirmed/avatax-order-confirmed-adapter";
import { AvataxOrderConfirmedPayloadService } from "@/modules/avatax/order-confirmed/avatax-order-confirmed-payload.service";
import { AvataxOrderConfirmedPayloadTransformer } from "@/modules/avatax/order-confirmed/avatax-order-confirmed-payload-transformer";
import { AvataxOrderConfirmedResponseTransformer } from "@/modules/avatax/order-confirmed/avatax-order-confirmed-response-transformer";
import { SaleorOrderToAvataxLinesTransformer } from "@/modules/avatax/order-confirmed/saleor-order-to-avatax-lines-transformer";

/**
 * Wrap all deps to create this service from minimum possible value (avatax config)
 *
 * Once we refactor these services to not require such configs, these should be created top level on each webhook
 */
export const createAvaTaxOrderConfirmedAdapterFromAvaTaxConfig = (config: AvataxConfig) => {
  const avaTaxSdk = new AvataxSdkClientFactory().createClient(config);
  const avaTaxClient = new AvataxClient(avaTaxSdk);
  const entityTypeMatcher = new AvataxEntityTypeMatcher(avaTaxClient);

  const orderToAvataxLinesTransformer = new SaleorOrderToAvataxLinesTransformer();
  const calculationDateResolver = new AvataxCalculationDateResolver();
  const documentCodeResolver = new AvataxDocumentCodeResolver();
  const avataxOrderConfirmedResponseTransformer = new AvataxOrderConfirmedResponseTransformer();
  const orderConfirmedPayloadTransformer = new AvataxOrderConfirmedPayloadTransformer(
    orderToAvataxLinesTransformer,
    entityTypeMatcher,
    calculationDateResolver,
    documentCodeResolver,
  );

  const avataxOrderConfirmedPayloadService = new AvataxOrderConfirmedPayloadService(
    orderConfirmedPayloadTransformer,
  );

  return new AvataxOrderConfirmedAdapter(
    avaTaxClient,
    avataxOrderConfirmedResponseTransformer,
    avataxOrderConfirmedPayloadService,
  );
};
