import { Client } from "urql";

import {
  AvataxExemptionStatusMetadataInput,
  buildExemptionStatusMetadataMutationPlan,
} from "./avatax-exemption-status-metadata";
import { ExemptionStatusMetadataManager } from "./exemption-status-metadata-manager";

type Params = {
  id: string;
  currentMetadataValue: string | null | undefined;
  isExemptionApplied: boolean;
  next: AvataxExemptionStatusMetadataInput;
  client: Client;
  onError: (error: unknown) => void;
};

export const updateExemptionStatusPublicMetadata = (params: Params): Promise<void> | void => {
  const plan = buildExemptionStatusMetadataMutationPlan({
    isExemptionApplied: params.isExemptionApplied,
    currentMetadataValue: params.currentMetadataValue,
    next: params.next,
  });

  if (plan.type === "none") {
    return;
  }

  const metadataManager = new ExemptionStatusMetadataManager(params.client);

  const promise =
    plan.type === "update"
      ? metadataManager.updateExemptionStatusMetadata(params.id, plan.value)
      : metadataManager.deleteExemptionStatusMetadata(params.id);

  promise.catch(params.onError);

  return promise;
};
