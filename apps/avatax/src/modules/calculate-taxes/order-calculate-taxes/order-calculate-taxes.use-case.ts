import { errAsync, okAsync, Result } from "neverthrow";
import { CalculateTaxesPayload } from "../calculate-taxes-payload";
import { IMetadataAppConfig } from "../metadata-app-config";
import { AuthData } from "@saleor/app-sdk/APL";
import { OrderCalculateTaxesErrors } from "./order-calculate-taxes.errors";
import { getActiveConnectionService } from "../../taxes/get-active-connection-service";

type Errors = typeof OrderCalculateTaxesErrors.MissingConfigError;

export interface IOrderCalculateTaxesUseCase {
  calculateTaxes(params: {
    payload: CalculateTaxesPayload;
    appConfig: IMetadataAppConfig;
    authData: AuthData;
    // TODO Verify difference with ResultAsync
  }): Promise<Result<any, Errors["prototype"]>>;
}

export class OrderCalculateTaxesUseCase implements IOrderCalculateTaxesUseCase {
  async calculateTaxes({
    payload,
    appConfig,
    authData,
  }: {
    payload: CalculateTaxesPayload;
    appConfig: IMetadataAppConfig;
    authData: AuthData;
  }) {
    if (!appConfig.hasMetadata()) {
      const error = new OrderCalculateTaxesErrors.MissingConfigError(
        "Missing metadata in webhook payload. ",
      );

      return errAsync(error);
    }
    console.log(appConfig.getDecryptedItems());

    /**
     * TODO Remove this service and clean this up. For now I need to keep it because configuration logic is so complicated that I need separate day to refactor it.
     */
    const activeConnectionServiceResult = getActiveConnectionService(
      payload.getChannelSlug(),
      appConfig.getRawItems(),
      authData,
    );

    if (activeConnectionServiceResult.isErr()) {
      // TODO: Translate errors to higher level
      return errAsync(activeConnectionServiceResult.error);
    }

    const result = await activeConnectionServiceResult.value.calculateTaxes(payload.rawPayload);

    return okAsync(result);
  }
}
