import { safeParseJson } from "../safe-parse-json";
import { type MetadataItem } from "../webhook-event-types";

export function metadataToAlgoliaAttribute(metadata: MetadataItem[]) {
  return Object.fromEntries(metadata?.map(({ key, value }) => [key, safeParseJson(value)]) || []);
}
