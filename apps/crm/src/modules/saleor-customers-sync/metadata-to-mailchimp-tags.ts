import { CustomerFragment } from "../../../generated/graphql";
import { z } from "zod";

/**
 * Metadata with this will be used to parse tags
 * Value should be JSON.stringify(Array<string>)
 */
const METADATA_KEY = "mailchimp_tags";

const TagsSchema = z.array(z.string());

export const metadataToMailchimpTags = (customerFragment: CustomerFragment): string[] => {
  const metadataItem = customerFragment.privateMetadata.find((m) => m.key === METADATA_KEY);

  if (!metadataItem) {
    return [];
  }

  try {
    return TagsSchema.parse(JSON.parse(metadataItem.value));
  } catch (e) {
    return [];
  }
};
