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
import { RefundType } from "avatax/lib/enums/RefundType";

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

export type CommitTransactionArgs = {
  companyCode: string;
  transactionCode: string;
  model: CommitTransactionModel;
  documentType: DocumentType;
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

export type RefundTransactionParams = {
  refundDate: Date;
  transactionCode: string;
  companyCode: string;
};

export class AvataxClient {
  private client: Avatax;

  constructor(baseConfig: BaseAvataxConfig) {
    const settings = createAvataxSettings({ isSandbox: baseConfig.isSandbox });
    const avataxClient = new Avatax(settings).withSecurity(baseConfig.credentials);

    this.client = avataxClient;
  }

  async createTransaction({ model }: CreateTransactionArgs) {
    /*
     * We use createOrAdjustTransaction instead of createTransaction because
     * we must guarantee a way of idempotent update of the transaction due to the
     * migration requirements. The transaction can be created in the old flow, but committed in the new flow.
     */
    return this.client.createOrAdjustTransaction({ model: { createTransactionModel: model } });
  }

  async commitTransaction(args: CommitTransactionArgs) {
    return this.client.commitTransaction(args);
  }

  async voidTransaction({
    transactionCode,
    companyCode,
  }: {
    transactionCode: string;
    companyCode: string;
  }) {
    return this.client.voidTransaction({
      transactionCode,
      companyCode,
      model: { code: VoidReasonCode.DocVoided },
    });
  }

  async validateAddress({ address }: ValidateAddressArgs) {
    return this.client.resolveAddress(address);
  }

  async getFilteredTaxCodes({ filter }: { filter: string | null }) {
    const taxCodeService = new AvataxClientTaxCodeService(this.client);

    return taxCodeService.getFilteredTaxCodes({ filter });
  }

  async ping() {
    return this.client.ping();
  }

  async getEntityUseCode(useCode: string) {
    return this.client.listEntityUseCodes({
      // https://developer.avalara.com/avatax/filtering-in-rest/
      filter: `code eq ${useCode}`,
    });
  }

  async fullyRefundTransaction(params: RefundTransactionParams) {
    return this.client.refundTransaction({
      transactionCode: params.transactionCode,
      companyCode: params.companyCode,
      model: {
        refundTransactionCode: params.transactionCode,
        refundDate: params.refundDate,
        refundType: RefundType.Full,
      },
    });
  }
}
