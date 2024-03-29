import { NextApiRequest, NextApiResponse } from "next";
import { SyncWebhookEventType } from "@saleor/app-sdk/types";
import { AuthData } from "@saleor/app-sdk/APL";
import { CalculateTaxesPayload, ICalculateTaxesPayload } from "../calculate-taxes-payload";
import { IOrderCalculateTaxesUseCase } from "./order-calculate-taxes.use-case";
import { verifyCalculateTaxesPayload } from "../../webhooks/validate-webhook-payload";
import { createLogger } from "@saleor/apps-logger";
import { MetadataAppConfig } from "../metadata-app-config";
import { AppMetadataCache } from "../../../lib/app-metadata-cache";
import { IMetadataDecryptor } from "../metadata-decryptor";

/**
 * Controllers:
 * 1. Are created top level in webhook layer
 * 2. Are invoked by thin framework layer (api handler)
 * 3. Validate request, transform payload, throw early if needed
 * 4. Call use case to perform business logic
 * 5. Handle domain errors from use case
 * 6. Transform to response
 */
export class OrderCalculateTaxesController {
  private logger = createLogger("OrderCalculateTaxesController");

  constructor(
    private useCase: IOrderCalculateTaxesUseCase,
    /**
     * TODO: Inject factory instead creating metadata here
     */
    private metadataCache: AppMetadataCache,
    private metadataDecryptor: IMetadataDecryptor,
  ) {}

  private applyObservabilityMetadata() {
    /**
     * TODO:
     *  - Apply logger context
     *  - Apply OTEL params
     *  - Apply Sentry scope data
     */
  }

  async execute(
    request: NextApiRequest,
    response: NextApiResponse,
    ctx: {
      event: SyncWebhookEventType;
      authData: AuthData;
      payload: ICalculateTaxesPayload;
    },
  ) {
    const payload = new CalculateTaxesPayload(ctx.payload);
    const appConfig = new MetadataAppConfig(
      payload.getPrivateMetadataItems(),
      this.metadataCache,
      this.metadataDecryptor,
    );

    /**
     * This is not perfect, but replacing metadata app config with DB will need a little of refactor anyway. I decided not to be super pure here.
     */
    appConfig.setCache();

    const payloadVerificationResult = verifyCalculateTaxesPayload(payload.rawPayload);

    if (payloadVerificationResult.isErr()) {
      this.logger.warn("Failed to calculate taxes, due to incomplete payload", {
        error: payloadVerificationResult.error,
      });

      return response.status(400).send(payloadVerificationResult.error.message);
    }

    const useCaseResult = await this.useCase.calculateTaxes({
      payload,
      appConfig,
      authData: ctx.authData,
    });

    if (useCaseResult.isErr()) {
      console.log("ERRROR CONTROLER");
      console.error(useCaseResult.error);

      // todo error mapping
      return response.status(500).send("error");
    } else {
      return response.status(200).json(useCaseResult.value);
    }
  }
}
