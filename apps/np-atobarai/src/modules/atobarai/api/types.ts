import { BaseError } from "@saleor/errors";
import { Result } from "neverthrow";

import { AtobaraiMerchantCode } from "../atobarai-merchant-code";
import { AtobaraiSecretSpCode } from "../atobarai-secret-sp-code";
import { AtobaraiTerminalId } from "../atobarai-terminal-id";
import { AtobaraiCancelTransactionPayload } from "./atobarai-cancel-transaction-payload";
import { AtobaraiCancelTransactionSuccessResponse } from "./atobarai-cancel-transaction-success-response";
import { AtobaraiChangeTransactionPayload } from "./atobarai-change-transaction-payload";
import { AtobaraiFulfillmentReportPayload } from "./atobarai-fulfillment-report-payload";
import { AtobaraiFulfillmentReportSuccessResponse } from "./atobarai-fulfillment-report-success-response";
import { AtobaraiRegisterTransactionPayload } from "./atobarai-register-transaction-payload";
import { AtobaraiTransactionSuccessResponse } from "./atobarai-transaction-success-response";

export type AtobaraiApiRegisterTransactionErrors = InstanceType<
  typeof AtobaraiApiClientRegisterTransactionError | typeof AtobaraiMultipleResultsError
>;

export type AtobaraiApiChangeTransactionErrors = InstanceType<
  typeof AtobaraiApiClientChangeTransactionError | typeof AtobaraiMultipleResultsError
>;

export type AtobaraiApiClientFulfillmentReportError = InstanceType<
  typeof AtobaraiApiClientFulfillmentReportError | typeof AtobaraiMultipleResultsError
>;

export type AtobaraiApiClientCancelTransactionError = InstanceType<
  typeof AtobaraiApiClientCancelTransactionError | typeof AtobaraiMultipleResultsError
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
    options?: {
      rejectMultipleResults?: boolean;
    },
  ) => Promise<Result<AtobaraiTransactionSuccessResponse, AtobaraiApiRegisterTransactionErrors>>;
  changeTransaction: (
    payload: AtobaraiChangeTransactionPayload,
    options?: {
      rejectMultipleResults?: boolean;
    },
  ) => Promise<Result<AtobaraiTransactionSuccessResponse, AtobaraiApiChangeTransactionErrors>>;
  verifyCredentials: () => Promise<
    Result<null, InstanceType<typeof AtobaraiApiClientValidationError>>
  >;
  reportFulfillment: (
    payload: AtobaraiFulfillmentReportPayload,
    options?: {
      rejectMultipleResults?: boolean;
    },
  ) => Promise<
    Result<AtobaraiFulfillmentReportSuccessResponse, AtobaraiApiClientFulfillmentReportError>
  >;
  cancelTransaction: (
    payload: AtobaraiCancelTransactionPayload,
    options?: {
      rejectMultipleResults?: boolean;
    },
  ) => Promise<
    Result<AtobaraiCancelTransactionSuccessResponse, AtobaraiApiClientCancelTransactionError>
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
      apiError: undefined as string | undefined,
    } as const,
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
      apiError: undefined as string | undefined,
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

export const AtobaraiApiClientCancelTransactionErrorPublicCode =
  "AtobaraiCancelTransactionError" as const;

export const AtobaraiApiClientCancelTransactionError = BaseError.subclass(
  "AtobaraiApiClientCancelTransactionError",
  {
    props: {
      _brand: "AtobaraiApiClientCancelTransactionError" as const,
      publicCode: AtobaraiApiClientCancelTransactionErrorPublicCode,
      publicMessage: "Failed to cancel transaction with Atobarai",
    },
  },
);

export const AtobaraiMultipleResultsErrorPublicCode = "AtobaraiMultipleResultsError" as const;

export const AtobaraiMultipleResultsError = BaseError.subclass("AtobaraiMultipleResultsError", {
  props: {
    _brand: "AtobaraiMultipleResultsError" as const,
    publicCode: AtobaraiMultipleResultsErrorPublicCode,
    publicMessage: "Atobarai returned multiple transactions",
  } as const,
});
