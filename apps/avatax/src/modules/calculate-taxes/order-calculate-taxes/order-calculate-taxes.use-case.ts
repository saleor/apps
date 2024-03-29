import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { CalculateTaxesPayload } from "../calculate-taxes-payload";
import { IMetadataAppConfig } from "../metadata-app-config";
import { AuthData } from "@saleor/app-sdk/APL";
import { OrderCalculateTaxesErrors } from "./order-calculate-taxes.errors";

type Errors = typeof OrderCalculateTaxesErrors.MissingConfigError;

export interface IOrderCalculateTaxesUseCase {
  calculateTaxes(params: {
    payload: CalculateTaxesPayload;
    appConfig: IMetadataAppConfig;
    authData: AuthData;
  }): ResultAsync<any, Errors["prototype"]>;
}

export class OrderCalculateTaxesUseCase implements IOrderCalculateTaxesUseCase {
  calculateTaxes({
    payload,
    appConfig,
    authData,
  }: {
    payload: CalculateTaxesPayload;
    appConfig: IMetadataAppConfig;
    authData: AuthData;
  }): ResultAsync<any, Errors["prototype"]> {
    if (!appConfig.hasMetadata()) {
      const error = new OrderCalculateTaxesErrors.MissingConfigError(
        "Missing metadata in webhook payload. ",
      );

      return errAsync(error);
    }

    return okAsync(null);
  }
}
