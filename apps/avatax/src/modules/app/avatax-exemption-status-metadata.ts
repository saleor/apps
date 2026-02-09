import { z } from "zod";

export const AVATAX_EXEMPTION_STATUS_METADATA_KEY = "avataxExemptionStatus" as const;

export const avataxExemptionStatusMetadataSchema = z.object({
  exemptAmountTotal: z.number(),
  entityUseCode: z.string().optional(),
  calculatedAt: z.string().datetime(),
});

export type AvataxExemptionStatusMetadata = z.infer<typeof avataxExemptionStatusMetadataSchema>;

export type AvataxExemptionStatusMetadataInput = {
  exemptAmountTotal: number;
  entityUseCode?: string;
  calculatedAt: Date;
};

export const serializeAvataxExemptionStatusMetadata = (
  input: AvataxExemptionStatusMetadataInput,
): AvataxExemptionStatusMetadata => {
  return {
    exemptAmountTotal: input.exemptAmountTotal,
    entityUseCode: input.entityUseCode,
    calculatedAt: input.calculatedAt.toISOString(),
  };
};

export const parseAvataxExemptionStatusMetadata = (
  rawValue: string | null | undefined,
): AvataxExemptionStatusMetadata | null => {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);

    const result = avataxExemptionStatusMetadataSchema.safeParse(parsed);

    if (!result.success) {
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
};

export type ExemptionStatusMetadataMutationPlan =
  | {
      type: "none";
    }
  | {
      type: "update";
      value: AvataxExemptionStatusMetadata;
    }
  | {
      type: "delete";
    };

export const buildExemptionStatusMetadataMutationPlan = (params: {
  isExemptionApplied: boolean;
  currentMetadataValue: string | null | undefined;
  next: AvataxExemptionStatusMetadataInput;
}): ExemptionStatusMetadataMutationPlan => {
  const parsedCurrent = parseAvataxExemptionStatusMetadata(params.currentMetadataValue);

  if (!params.isExemptionApplied) {
    return params.currentMetadataValue ? { type: "delete" } : { type: "none" };
  }

  const nextValue = serializeAvataxExemptionStatusMetadata(params.next);

  const isSameAsCurrent =
    parsedCurrent?.exemptAmountTotal === nextValue.exemptAmountTotal &&
    parsedCurrent?.entityUseCode === nextValue.entityUseCode;

  return isSameAsCurrent ? { type: "none" } : { type: "update", value: nextValue };
};
