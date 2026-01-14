import { Client } from "urql";

import { BaseError } from "@/error";
import { createLogger } from "@/logger";

import {
  DeletePublicMetadataMutation,
  UntypedDeletePublicMetadataDocument,
  UntypedUpdatePublicMetadataDocument,
  UpdatePublicMetadataMutation,
  UpdatePublicMetadataMutationVariables,
} from "../../../generated/graphql";

const CHECKOUT_EXEMPTION_STATUS_KEY = "avataxExemptionStatus";

export class CheckoutMetadataManager {
  private logger = createLogger("CheckoutMetadataManager");

  static BaseError = BaseError.subclass("CheckoutMetadataManagerError");
  static MutationError = CheckoutMetadataManager.BaseError.subclass(
    "CheckoutMetadataManagerMutationError",
  );

  constructor(private client: Client) {}

  async updateCheckoutMetadataWithExemptionStatus(
    checkoutId: string,
    exemptionStatus: {
      exemptAmountTotal: number;
      entityUseCode?: string;
      calculatedAt: Date;
    },
  ) {
    const serializedExemptionStatus = {
      ...exemptionStatus,
      calculatedAt: exemptionStatus.calculatedAt.toISOString(),
    };

    const variables: UpdatePublicMetadataMutationVariables = {
      id: checkoutId,
      input: [
        {
          key: CHECKOUT_EXEMPTION_STATUS_KEY,
          value: JSON.stringify(serializedExemptionStatus),
        },
      ],
    };

    const { error, data } = await this.client
      .mutation<UpdatePublicMetadataMutation>(UntypedUpdatePublicMetadataDocument, variables)
      .toPromise();

    const gqlErrors = data?.updateMetadata?.errors ?? [];

    const errorToReport = error ?? gqlErrors[0] ?? null;

    if (errorToReport) {
      const error = new CheckoutMetadataManager.MutationError(
        errorToReport.message ?? "Failed to update metadata",
        {
          props: {
            error: errorToReport,
          },
        },
      );

      this.logger.error("Failed to update metadata", {
        error,
      });

      throw new CheckoutMetadataManager.MutationError("Failed to update metadata", {
        props: { error },
      });
    }

    return;
  }

  async deleteCheckoutMetadataWithExemptionStatus(checkoutId: string) {
    const variables = {
      id: checkoutId,
      keys: [CHECKOUT_EXEMPTION_STATUS_KEY],
    };

    const { error, data } = await this.client
      .mutation<DeletePublicMetadataMutation>(UntypedDeletePublicMetadataDocument, variables)
      .toPromise();

    const gqlErrors = data?.deleteMetadata?.errors ?? [];

    const errorToReport = error ?? gqlErrors[0] ?? null;

    if (errorToReport) {
      const error = new CheckoutMetadataManager.MutationError(
        errorToReport.message ?? "Failed to delete metadata",
        {
          props: {
            error: errorToReport,
          },
        },
      );

      this.logger.error("Failed to delete metadata", {
        error,
      });

      throw new CheckoutMetadataManager.MutationError("Failed to delete metadata", {
        props: { error },
      });
    }

    return;
  }
}
