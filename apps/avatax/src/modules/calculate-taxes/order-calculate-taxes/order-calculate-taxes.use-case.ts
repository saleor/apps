import { ResultAsync } from "neverthrow";
import { CalculateTaxesPayload } from "../calculate-taxes-payload";
import { AppConfig } from "../app-config";

export interface IOrderCalculateTaxesUseCase {
  calculateTaxes(params: {
    payload: CalculateTaxesPayload;
    appConfig: AppConfig;
  }): ResultAsync<any, any>;
}

export class OrderCalculateTaxesUseCase implements IOrderCalculateTaxesUseCase {
  calculateTaxes({
    payload,
    appConfig,
  }: {
    payload: CalculateTaxesPayload;
    appConfig: AppConfig;
  }): ResultAsync<any, any> {}
}
