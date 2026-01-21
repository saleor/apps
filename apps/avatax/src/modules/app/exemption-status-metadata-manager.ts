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
import {
  AVATAX_EXEMPTION_STATUS_METADATA_KEY,
  AvataxExemptionStatusMetadata,
} from "./avatax-exemption-status-metadata";

export class ExemptionStatusMetadataManager {
  private logger = createLogger("ExemptionStatusMetadataManager");

  static BaseError = BaseError.subclass("ExemptionStatusMetadataManagerError");
  static MutationError = ExemptionStatusMetadataManager.BaseError.subclass(
    "ExemptionStatusMetadataManagerMutationError",
  );

  constructor(private client: Pick<Client, "mutation">) {}

  async updateExemptionStatusMetadata(id: string, metadata: AvataxExemptionStatusMetadata) {
    const variables: UpdatePublicMetadataMutationVariables = {
      id,
      input: [
        {
          key: AVATAX_EXEMPTION_STATUS_METADATA_KEY,
          value: JSON.stringify(metadata),
        },
      ],
    };

    const { error, data } = await this.client
      .mutation<UpdatePublicMetadataMutation>(UntypedUpdatePublicMetadataDocument, variables)
      .toPromise();

    const gqlErrors = data?.updateMetadata?.errors ?? [];

    const errorToReport = error ?? gqlErrors[0] ?? null;

    if (errorToReport) {
      const error = new ExemptionStatusMetadataManager.MutationError(
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

      throw new ExemptionStatusMetadataManager.MutationError("Failed to update metadata", {
        props: { error },
      });
    }

    return;
  }

  async deleteExemptionStatusMetadata(id: string) {
    const variables = {
      id,
      keys: [AVATAX_EXEMPTION_STATUS_METADATA_KEY],
    };

    const { error, data } = await this.client
      .mutation<DeletePublicMetadataMutation>(UntypedDeletePublicMetadataDocument, variables)
      .toPromise();

    const gqlErrors = data?.deleteMetadata?.errors ?? [];

    const errorToReport = error ?? gqlErrors[0] ?? null;

    if (errorToReport) {
      const error = new ExemptionStatusMetadataManager.MutationError(
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

      throw new ExemptionStatusMetadataManager.MutationError("Failed to delete metadata", {
        props: { error },
      });
    }

    return;
  }
}
