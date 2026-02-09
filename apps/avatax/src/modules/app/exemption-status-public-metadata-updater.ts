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
  client: Pick<Client, "mutation">;
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

  let promise: Promise<void>;

  switch (plan.type) {
    case "update":
      promise = metadataManager.updateExemptionStatusMetadata(params.id, plan.value);
      break;
    case "delete":
      promise = metadataManager.deleteExemptionStatusMetadata(params.id);
      break;
    default: {
      /**
       * Exhaustiveness check - this should never happen at runtime
       * but ensures type safety if new plan types are added
       */
      const exhaustiveCheck: never = plan;

      throw new Error(`Unhandled plan type: ${JSON.stringify(exhaustiveCheck)}`);
    }
  }

  promise.catch(params.onError);

  return promise;
};
