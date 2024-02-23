import Avatax from "avatax";
import { DocumentType } from "avatax/lib/enums/DocumentType";
import { VoidReasonCode } from "avatax/lib/enums/VoidReasonCode";
import { AddressLocationInfo as AvataxAddress } from "avatax/lib/models/AddressLocationInfo";
import { CommitTransactionModel } from "avatax/lib/models/CommitTransactionModel";
import { CreateTransactionModel } from "avatax/lib/models/CreateTransactionModel";
import { LogOptions } from "avatax/lib/utils/logger";
import packageJson from "../../../package.json";
import { AvataxClientTaxCodeService } from "./avatax-client-tax-code.service";
import { BaseAvataxConfig } from "./avatax-connection-schema";
import { createLogger } from "../../logger";
import { fromPromise, fromThrowable } from "neverthrow";
import { BaseError } from "../../error";

type AvataxSettings = {
  appName: string;
  appVersion: string;
  environment: "sandbox" | "production";
  machineName: string;
  timeout: number;
  logOptions?: LogOptions;
};

const defaultAvataxSettings: AvataxSettings = {
  appName: packageJson.name,
  appVersion: packageJson.version,
  environment: "sandbox",
  machineName: "tax-app",
  timeout: 5000,
};

const createAvataxSettings = ({ isSandbox }: { isSandbox: boolean }): AvataxSettings => {
  const settings: AvataxSettings = {
    ...defaultAvataxSettings,
    environment: isSandbox ? "sandbox" : "production",
  };

  return settings;
};

export type CreateTransactionArgs = {
  model: CreateTransactionModel;
};

export type ValidateAddressArgs = {
  address: AvataxAddress;
};

export type VoidTransactionArgs = {
  transactionCode: string;
  companyCode: string;
};

const logger = createLogger("AvataxClient");

export const AvataxClientErrors = {
  /**
   * Generic one, we should create more specific ones too
   */
  CreateTransactionError: BaseError.subclass("CreateTransactionError"),
  VoidTransactionError: BaseError.subclass("VoidTransactionError"),
  ValidateAddressError: BaseError.subclass("ValidateAddressError"),
  GetFilteredTaxCodes: BaseError.subclass("ValidateAddressErrorValidateAddressError"),
  PingError: BaseError.subclass("PingError"),
  GetEntityUseCodeError: BaseError.subclass("GetEntityUseCodeError"),
};

export class AvataxClient {
  private client: Avatax;

  constructor(
    baseConfig: BaseAvataxConfig,
    options?: {
      /**
       * Allow to inject client for testing (dependency injection)
       */
      avataxClient?: Avatax;
    },
  ) {
    const settings = createAvataxSettings({ isSandbox: baseConfig.isSandbox });
    const avataxClient =
      options?.avataxClient ?? new Avatax(settings).withSecurity(baseConfig.credentials);

    this.client = avataxClient;
  }

  createTransaction({ model }: CreateTransactionArgs) {
    logger.info("createTransaction was called", {
      transaction: model,
    });

    /*
     * We use createOrAdjustTransaction instead of createTransaction because
     * we must guarantee a way of idempotent update of the transaction due to the
     * migration requirements. The transaction can be created in the old flow, but committed in the new flow.
     */
    return fromPromise(
      this.client.createOrAdjustTransaction({
        model: { createTransactionModel: model },
      }),
      /**
       * Transform any error from Avatax to the custom one.
       * Perform mapping too - ensure specific reasons are exposed
       */
      AvataxClientErrors.CreateTransactionError.normalize,
    );
  }

  voidTransaction({
    transactionCode,
    companyCode,
  }: {
    transactionCode: string;
    companyCode: string;
  }) {
    logger.info("voidTransaction was called", {
      transactionCode,
      companyCode,
    });

    return fromPromise(
      this.client.voidTransaction({
        transactionCode,
        companyCode,
        model: { code: VoidReasonCode.DocVoided },
      }),
      AvataxClientErrors.VoidTransactionError.normalize,
    );
  }

  validateAddress({ address }: ValidateAddressArgs) {
    logger.debug("validateAddress was called");

    return fromPromise(
      this.client.resolveAddress(address),
      AvataxClientErrors.ValidateAddressError.normalize,
    );
  }

  getFilteredTaxCodes({ filter }: { filter: string | null }) {
    const taxCodeService = new AvataxClientTaxCodeService(this.client);

    return fromPromise(
      taxCodeService.getFilteredTaxCodes({ filter }),
      AvataxClientErrors.GetFilteredTaxCodes.normalize,
    );
  }

  ping() {
    return fromPromise(this.client.ping(), AvataxClientErrors.PingError.normalize);
  }

  getEntityUseCode(useCode: string) {
    return fromPromise(
      this.client.listEntityUseCodes({
        // https://developer.avalara.com/avatax/filtering-in-rest/
        filter: `code eq ${useCode}`,
      }),
      AvataxClientErrors.GetEntityUseCodeError.normalize,
    );
  }
}
