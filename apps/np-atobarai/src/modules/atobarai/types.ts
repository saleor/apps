import { BaseError } from "@saleor/errors";
import { Result } from "neverthrow";

import { AtobaraiChangeTransactionPayload } from "./atobarai-change-transaction-payload";
import { AtobaraiFulfillmentReportPayload } from "./atobarai-fulfillment-report-payload";
import { AtobaraiFulfillmentReportSuccessResponse } from "./atobarai-fulfillment-report-success-response";
import { AtobaraiMerchantCode } from "./atobarai-merchant-code";
import { AtobaraiRegisterTransactionPayload } from "./atobarai-register-transaction-payload";
import { AtobaraiSecretSpCode } from "./atobarai-secret-sp-code";
import { AtobaraiTerminalId } from "./atobarai-terminal-id";
import { AtobaraiTransactionSuccessResponse } from "./atobarai-transaction-success-response";

export type AtobaraiApiRegisterTransactionErrors = InstanceType<
  typeof AtobaraiApiClientRegisterTransactionError
>;

export type AtobaraiApiChangeTransactionErrors = InstanceType<
  typeof AtobaraiApiClientChangeTransactionError
>;

export type AtobaraiApiClientFulfillmentReportError = InstanceType<
  typeof AtobaraiApiClientFulfillmentReportError
>;

export type AtobaraiEnvironment = "sandbox" | "production";

export interface IAtobaraiApiClientFactory {
  create(args: {
    atobaraiTerminalId: AtobaraiTerminalId;
    atobaraiMerchantCode: AtobaraiMerchantCode;
    atobaraiSecretSpCode: AtobaraiSecretSpCode;
    atobaraiEnvironment: AtobaraiEnvironment;
  }): IAtobaraiApiClient;
}

export interface IAtobaraiApiClient {
  registerTransaction: (
    payload: AtobaraiRegisterTransactionPayload,
  ) => Promise<Result<AtobaraiTransactionSuccessResponse, AtobaraiApiRegisterTransactionErrors>>;
  changeTransaction: (
    payload: AtobaraiChangeTransactionPayload,
  ) => Promise<Result<AtobaraiTransactionSuccessResponse, AtobaraiApiChangeTransactionErrors>>;
  verifyCredentials: () => Promise<
    Result<null, InstanceType<typeof AtobaraiApiClientValidationError>>
  >;
  reportFulfillment: (
    payload: AtobaraiFulfillmentReportPayload,
  ) => Promise<
    Result<AtobaraiFulfillmentReportSuccessResponse, AtobaraiApiClientFulfillmentReportError>
  >;
}

export const AtobaraiApiClientRegisterTransactionErrorPublicCode =
  "AtobaraiRegisterTransactionError" as const;

export const AtobaraiApiClientRegisterTransactionError = BaseError.subclass(
  "AtobaraiApiClientRegisterTransactionError",
  {
    props: {
      _brand: "AtobaraiApiClientRegisterTransactionError" as const,
      publicCode: AtobaraiApiClientRegisterTransactionErrorPublicCode,
      publicMessage: "Failed to register transaction with Atobarai",
    },
  },
);

export const AtobaraiApiClientChangeTransactionErrorPublicCode =
  "AtobaraiChangeTransactionError" as const;

export const AtobaraiApiClientChangeTransactionError = BaseError.subclass(
  "AtobaraiApiClientChangeTransactionError",
  {
    props: {
      _brand: "AtobaraiApiClientChangeTransactionError" as const,
      publicCode: AtobaraiApiClientChangeTransactionErrorPublicCode,
      publicMessage: "Failed to change transaction with Atobarai",
    },
  },
);

export const AtobaraiApiClientValidationError = BaseError.subclass(
  "AtobaraiApiClientValidationError",
  {
    props: {
      _brand: "AtobaraiApiClientValidationError",
      publicCode: AtobaraiApiClientRegisterTransactionErrorPublicCode,
      publicMessage: "Failed to authenticate with Atobarai",
    },
  },
);

export const AtobaraiApiClientFulfillmentReportErrorPublicCode =
  "AtobaraiFulfillmentReportError" as const;

export const AtobaraiApiClientFulfillmentReportError = BaseError.subclass(
  "AtobaraiApiClientFulfillmentReportError",
  {
    props: {
      _brand: "AtobaraiApiClientFulfillmentReportError" as const,
      publicCode: AtobaraiApiClientFulfillmentReportErrorPublicCode,
      publicMessage: "Failed to report fulfillment with Atobarai",
    },
  },
);
