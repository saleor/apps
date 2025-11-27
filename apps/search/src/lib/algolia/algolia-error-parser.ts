import { z } from "zod";

const shape = z.object({
  status: z.number(),
  message: z.string(),
});

export interface RecordSizeErrorDetails {
  objectId: string;
  actualSize: number;
  maxSize: number;
  rawMessage: string;
}

const RECORD_SIZE_DOCS_URL =
  "https://docs.saleor.io/developer/app-store/apps/search#assumptions--limitations";

/**
 * Creates a user-friendly error message for Algolia record size errors.
 * This error is expected when product data exceeds Algolia's 10KB limit.
 */
export const createRecordSizeErrorMessage = (
  details: RecordSizeErrorDetails | null,
  context: { productId?: string; variantId?: string },
): string => {
  const sizeInfo = details
    ? `Current size: ${details.actualSize} bytes, limit: ${details.maxSize} bytes.`
    : "Record exceeds Algolia size limit.";

  const productInfo = context.variantId
    ? `Product variant ${context.variantId}`
    : context.productId
    ? `Product ${context.productId}`
    : "Product";

  return [
    `${productInfo} exceeds Algolia's record size limit (10KB).`,
    sizeInfo,
    "",
    "To fix this issue:",
    "1. Go to Search App settings in Saleor Dashboard",
    "2. In 'Algolia fields filtering' section, disable large fields you don't need:",
    "   - 'description' / 'descriptionPlaintext' - often the largest fields",
    "   - 'metadata' / 'variantMetadata' - can contain large data",
    "   - 'media' - if you don't need media URLs in search results",
    "",
    "If you still need searchable description, create a shorter product attribute",
    "(e.g. 'algoliaDescription') - attributes are synced automatically.",
    "",
    `Documentation: ${RECORD_SIZE_DOCS_URL}`,
  ].join("\n");
};

export const AlgoliaErrorParser = {
  isAuthError: (error: unknown) => {
    const parsed = shape.safeParse(error);

    if (!parsed.success) {
      return false;
    }

    return parsed.data.status === 403 || parsed.data.status === 401;
  },
  isRecordSizeTooBigError: (error: unknown) => {
    const parsed = shape.safeParse(error);

    if (!parsed.success) {
      return false;
    }

    return parsed.data.status === 400 && /Record.*is too big/.test(parsed.data.message);
  },
  /**
   * Parse record size error to extract details like objectId and sizes.
   * Example message: "Record at the position 0 objectID=abc123_def456 is too big size=30602/10000 bytes"
   */
  parseRecordSizeError: (error: unknown): RecordSizeErrorDetails | null => {
    const parsed = shape.safeParse(error);

    if (!parsed.success) {
      return null;
    }

    const message = parsed.data.message;

    // Extract objectID
    const objectIdMatch = message.match(/objectID=([^\s]+)/);
    // Extract sizes (actual/max)
    const sizeMatch = message.match(/size=(\d+)\/(\d+)/);

    if (!objectIdMatch || !sizeMatch) {
      return null;
    }

    return {
      objectId: objectIdMatch[1],
      actualSize: parseInt(sizeMatch[1], 10),
      maxSize: parseInt(sizeMatch[2], 10),
      rawMessage: message,
    };
  },
  getErrorMessage: (error: unknown): string => {
    const parsed = shape.safeParse(error);

    if (!parsed.success) {
      return "Unknown error";
    }

    return parsed.data.message;
  },
};
