import { Client } from "urql";

import { BaseError } from "@/error";
import { createLogger } from "@/logger";

import {
  UpdatePublicMetadataDocument,
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
      exemptionAppliedToCheckout: boolean;
      exemptAmountTotal: number;
      entityUseCode?: string;
      calculatedAt: string;
    },
  ) {
    const variables: UpdatePublicMetadataMutationVariables = {
      id: checkoutId,
      input: [
        {
          key: CHECKOUT_EXEMPTION_STATUS_KEY,
          value: JSON.stringify(exemptionStatus),
        },
      ],
    };

    const { error, data } = await this.client
      .mutation<UpdatePublicMetadataMutation>(UpdatePublicMetadataDocument, variables)
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

    return { ok: true };
  }
}
