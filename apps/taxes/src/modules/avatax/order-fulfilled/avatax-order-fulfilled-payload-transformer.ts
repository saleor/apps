import { DocumentType } from "avatax/lib/enums/DocumentType";
import { z } from "zod";
import { AvataxConfig } from "../avatax-connection-schema";
import {
  AvataxOrderFulfilledPayload,
  AvataxOrderFulfilledTarget,
} from "./avatax-order-fulfilled-adapter";

export class AvataxOrderFulfilledPayloadTransformer {
  constructor(private readonly config: AvataxConfig) {}
  private matchDocumentType(config: AvataxConfig): DocumentType {
    if (!config.isDocumentRecordingEnabled) {
      return DocumentType.SalesOrder;
    }

    return DocumentType.SalesInvoice;
  }
  transform({ order }: AvataxOrderFulfilledPayload): AvataxOrderFulfilledTarget {
    const transactionCode = z.string().min(1).parse(order.avataxId);

    return {
      transactionCode,
      companyCode: this.config.companyCode ?? "",
      documentType: this.matchDocumentType(this.config),
      model: {
        commit: true,
      },
    };
  }
}
