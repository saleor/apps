import { MetadataItem } from "../../../generated/graphql";
import { safeParseJson } from "../safe-parse-json";

export function metadataToTypesenseAttribute(metadata: MetadataItem[]) {
  return Object.fromEntries(metadata?.map(({ key, value }) => [key, safeParseJson(value)]) || []);
}
