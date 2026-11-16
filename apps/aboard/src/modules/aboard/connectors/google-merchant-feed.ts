import { BaseError } from "@saleor/errors";
import { err, Result, ResultAsync } from "neverthrow";
import { SaxesParser } from "saxes";

import { hash } from "../hash";
import { sourceChannel } from "../source-channel";
import {
  type DraftAttributeValue,
  type DraftMedia,
  type DraftProduct,
  type DraftProductVariant,
  type SaleorDraftCatalog,
} from "../types";

export const GOOGLE_MERCHANT_FEED_CONNECTOR_ID = "google-merchant-feed";
export const GOOGLE_MERCHANT_FEED_VERSION = "rss-2.0";
export const GOOGLE_MERCHANT_FEED_CHANNEL_NAME = "Google Merchant Feed Import";
export const GOOGLE_MERCHANT_FEED_CHANNEL_SLUG = "google-merchant-feed-import";

const GOOGLE_NAMESPACE = "http://base.google.com/ns/1.0";

export const GOOGLE_MERCHANT_FEED_MAX_BYTES = 10 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;
const PRODUCT_LIMIT = 1000;

type FeedItem = {
  fields: Map<string, string[]>;
};

type ParsedGoogleMerchantFeed = {
  title?: string;
  link?: string;
  description?: string;
  items: FeedItem[];
};

export const GoogleMerchantFeedInputError = BaseError.subclass(
  "GoogleMerchantFeed.GoogleMerchantFeedInputError",
  {
    props: { _brand: "GoogleMerchantFeed.GoogleMerchantFeedInputError" as const },
  },
);

export type GoogleMerchantFeedInputError = InstanceType<typeof GoogleMerchantFeedInputError>;

const directChildFieldNames = new Set([
  "title",
  "link",
  "description",
  "g:id",
  "g:item_group_id",
  "g:title",
  "g:description",
  "g:link",
  "g:image_link",
  "g:additional_image_link",
  "g:price",
  "g:sale_price",
  "g:availability",
  "g:condition",
  "g:product_type",
  "g:google_product_category",
  "g:brand",
  "g:gtin",
  "g:color",
  "g:size",
  "g:material",
  "g:pattern",
  "g:shipping_label",
]);

const metadataFieldNames = [
  "g:product_type",
  "g:google_product_category",
  "g:brand",
  "g:gtin",
  "g:availability",
  "g:condition",
  "g:shipping_label",
];

const variantAttributeNames = ["g:color", "g:size", "g:material", "g:pattern"];
const supportedAvailabilityValues = new Set(["in_stock", "out_of_stock", "preorder", "backorder"]);

const parseMoney = (value: string | undefined) => {
  const match = value?.trim().match(/^([0-9]+(?:\.[0-9]+)?)\s+([A-Z]{3})$/);

  if (!match) {
    return undefined;
  }

  const amount = Number(match[1]);

  if (!Number.isFinite(amount)) {
    return undefined;
  }

  return {
    amount,
    currency: match[2],
  };
};

const firstField = (item: FeedItem, ...keys: string[]) => {
  for (const key of keys) {
    const value = item.fields.get(key)?.find((fieldValue) => fieldValue.trim() !== "");

    if (value) {
      return value.trim();
    }
  }

  return undefined;
};

const allFields = (item: FeedItem, key: string) =>
  (item.fields.get(key) ?? []).map((value) => value.trim()).filter(Boolean);

const externalSourceId = (id: string) => `${GOOGLE_MERCHANT_FEED_CONNECTOR_ID}:${id}`;
const hashSourceInstance = (value: string) => `sha256:${hash(value)}`;

const tagKey = (tag: { local?: string; prefix?: string; uri?: string; name: string }) => {
  if (tag.uri === GOOGLE_NAMESPACE && tag.local) {
    return `g:${tag.local}`;
  }

  return tag.local ?? tag.name;
};

const appendField = (fields: Map<string, string[]>, key: string, value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return;
  }

  fields.set(key, [...(fields.get(key) ?? []), trimmed]);
};

const readFirstXmlElementName = (xml: string) => {
  let rest = xml.replace(/^\uFEFF/, "").trimStart();

  while (rest.startsWith("<?") || rest.startsWith("<!--")) {
    const close = rest.startsWith("<?") ? "?>" : "-->";
    const end = rest.indexOf(close);

    if (end === -1) {
      return undefined;
    }

    rest = rest.slice(end + close.length).trimStart();
  }

  return rest.match(/^<([A-Za-z_][\w:.-]*)\b/)?.[1];
};

const readGoogleMerchantRssFeed = (xml: string): ParsedGoogleMerchantFeed => {
  if (/<!DOCTYPE/i.test(xml)) {
    throw new GoogleMerchantFeedInputError("Google Merchant feed must not include a DOCTYPE.");
  }

  const rootElementName = readFirstXmlElementName(xml);

  if (!rootElementName) {
    if (xml.includes("<rss")) {
      throw new GoogleMerchantFeedInputError(
        "Google Merchant feed is not valid XML: the document has text before <rss>. Use a direct XML feed that starts with <rss> or an XML declaration.",
      );
    }

    throw new GoogleMerchantFeedInputError(
      "Google Merchant feed response did not contain XML. Use a direct HTTPS URL to the RSS XML feed, not a web page.",
    );
  }

  if (rootElementName !== "rss") {
    throw new GoogleMerchantFeedInputError(
      `Google Merchant feed must be RSS XML starting with <rss>; received <${rootElementName}>.`,
    );
  }

  const parser = new SaxesParser({ xmlns: true });
  const items: FeedItem[] = [];
  const channelFields = new Map<string, string[]>();
  const elementStack: string[] = [];
  let currentItem: FeedItem | null = null;
  let activeField: { target: "channel" | "item"; key: string; text: string } | null = null;
  let parseError: Error | null = null;

  parser.on("error", (error) => {
    parseError = error;
  });

  parser.on("opentag", (tag) => {
    const key = tagKey(tag);
    const parent = elementStack[elementStack.length - 1];

    elementStack.push(key);

    if (key === "item" && parent === "channel") {
      currentItem = { fields: new Map() };

      return;
    }

    if (currentItem && parent === "item" && directChildFieldNames.has(key)) {
      activeField = { target: "item", key, text: "" };

      return;
    }

    if (!currentItem && parent === "channel" && directChildFieldNames.has(key)) {
      activeField = { target: "channel", key, text: "" };
    }
  });

  parser.on("text", (text) => {
    if (activeField) {
      activeField.text += text;
    }
  });

  parser.on("cdata", (text) => {
    if (activeField) {
      activeField.text += text;
    }
  });

  parser.on("closetag", (tag) => {
    const key = tagKey(tag);

    if (activeField?.key === key) {
      appendField(
        activeField.target === "item" && currentItem ? currentItem.fields : channelFields,
        activeField.key,
        activeField.text,
      );
      activeField = null;
    }

    if (key === "item" && currentItem) {
      items.push(currentItem);
      currentItem = null;
    }

    elementStack.pop();
  });

  try {
    parser.write(xml).close();
  } catch (error) {
    parseError = error instanceof Error ? error : new Error(String(error));
  }

  if (parseError) {
    throw new GoogleMerchantFeedInputError(
      `Google Merchant feed is not valid XML: ${parseError.message}. Escape bare ampersands as &amp; or wrap text values in CDATA.`,
    );
  }

  return {
    title: channelFields.get("title")?.[0],
    link: channelFields.get("link")?.[0],
    description: channelFields.get("description")?.[0],
    items,
  };
};

const downloadGoogleMerchantFeed = async (value: string): Promise<string> => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new GoogleMerchantFeedInputError("Enter a valid Google Merchant feed URL.");
  }

  if (url.protocol !== "https:" || url.username || url.password) {
    throw new GoogleMerchantFeedInputError(
      "Google Merchant feed URL must use HTTPS without credentials.",
    );
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal, credentials: "omit" });

    if (!response.ok) {
      throw new GoogleMerchantFeedInputError(`Google Merchant feed returned ${response.status}.`);
    }
    const reader = response.body?.getReader();

    if (!reader) throw new GoogleMerchantFeedInputError("The feed response is empty.");
    const decoder = new TextDecoder();
    let received = 0;
    let xml = "";

    try {
      while (true) {
        const { value, done } = await reader.read();

        if (done) break;
        received += value.byteLength;
        if (received > GOOGLE_MERCHANT_FEED_MAX_BYTES) {
          await reader.cancel();
          throw new GoogleMerchantFeedInputError(
            "Google Merchant feed is larger than the 10 MB limit.",
          );
        }
        xml += decoder.decode(value, { stream: true });
      }

      return xml + decoder.decode();
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    if (error instanceof GoogleMerchantFeedInputError) throw error;
    throw new GoogleMerchantFeedInputError(
      "The browser could not download this feed. Download it yourself and choose the XML file instead.",
    );
  } finally {
    clearTimeout(timeout);
  }
};

const makeMetadata = (item: FeedItem): DraftAttributeValue[] =>
  metadataFieldNames.flatMap((key) => {
    const value = firstField(item, key);

    return value ? [{ attribute: `google.${key.replace(/^g:/, "")}`, value }] : [];
  });

const makeVariantAttributes = (item: FeedItem): DraftAttributeValue[] =>
  variantAttributeNames.flatMap((key) => {
    const value = firstField(item, key);

    return value ? [{ attribute: key.replace(/^g:/, ""), value }] : [];
  });

const splitMediaUrls = (values: Array<string | undefined>) =>
  values
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

const mediaForGroup = (items: FeedItem[]): DraftMedia[] => {
  const seen = new Set<string>();

  return items.flatMap((item) =>
    splitMediaUrls([
      firstField(item, "g:image_link"),
      ...allFields(item, "g:additional_image_link"),
    ]).flatMap((url) => {
      if (seen.has(url)) {
        return [];
      }

      seen.add(url);

      return [{ url }];
    }),
  );
};

const groupItems = (items: FeedItem[]) => {
  const groups = new Map<string, FeedItem[]>();

  for (const item of items) {
    const id = firstField(item, "g:item_group_id") ?? firstField(item, "g:id");

    if (!id) {
      throw new GoogleMerchantFeedInputError("Google Merchant feed item is missing g:id.");
    }

    groups.set(id, [...(groups.get(id) ?? []), item]);
  }

  return groups;
};

const buildDraftCatalog = (
  feed: ParsedGoogleMerchantFeed,
  sourceInstanceId = hashSourceInstance(
    feed.link?.trim() || JSON.stringify(feed.items.map((item) => [...item.fields.entries()])),
  ),
): SaleorDraftCatalog => {
  if (feed.items.length > PRODUCT_LIMIT) {
    throw new GoogleMerchantFeedInputError(
      "Google Merchant feed import is blocked because it has more than 1,000 items.",
    );
  }

  const currencies = new Set<string>();
  const products: DraftProduct[] = [];

  for (const [groupId, items] of groupItems(feed.items)) {
    const firstItem = items[0];

    if (!firstItem) {
      continue;
    }

    const productTitle = firstField(firstItem, "g:title", "title");

    if (!productTitle) {
      throw new GoogleMerchantFeedInputError(`${groupId}: feed item is missing g:title.`);
    }

    const availabilityValues = new Set<string>();
    const variants: DraftProductVariant[] = items.map((item) => {
      const variantId = firstField(item, "g:id");

      if (!variantId) {
        throw new GoogleMerchantFeedInputError(`${productTitle}: feed item is missing g:id.`);
      }

      const title = firstField(item, "g:title", "title");
      const link = firstField(item, "g:link", "link");
      const image = firstField(item, "g:image_link");
      const availability = firstField(item, "g:availability");
      const priceText = firstField(item, "g:sale_price") ?? firstField(item, "g:price");
      const money = parseMoney(priceText);

      if (!title) {
        throw new GoogleMerchantFeedInputError(`${variantId}: feed item is missing g:title.`);
      }

      if (!link) {
        throw new GoogleMerchantFeedInputError(`${variantId}: feed item is missing g:link.`);
      }

      if (!image) {
        throw new GoogleMerchantFeedInputError(`${variantId}: feed item is missing g:image_link.`);
      }

      if (!money) {
        throw new GoogleMerchantFeedInputError(
          `${variantId}: feed item price must include a non-negative amount and three-letter currency.`,
        );
      }

      if (!availability || !supportedAvailabilityValues.has(availability)) {
        throw new GoogleMerchantFeedInputError(
          `${variantId}: g:availability must be in_stock, out_of_stock, preorder, or backorder.`,
        );
      }

      currencies.add(money.currency);
      availabilityValues.add(availability);

      return {
        id: externalSourceId(variantId),
        sku: variantId,
        name: title,
        attributes: makeVariantAttributes(item),
        price: {
          currency: money.currency,
          amount: money.amount,
        },
      };
    });

    if (availabilityValues.size > 1) {
      throw new GoogleMerchantFeedInputError(
        `${productTitle}: variants with mixed availability are not supported.`,
      );
    }

    const availability = availabilityValues.values().next().value;

    products.push({
      id: externalSourceId(groupId),
      name: productTitle,
      description: firstField(firstItem, "g:description", "description"),
      productType: "Google Merchant Feed",
      isPublished: true,
      isAvailableForPurchase: availability !== "out_of_stock",
      metadata: [
        ...makeMetadata(firstItem),
        ...(firstField(firstItem, "g:link", "link")
          ? [{ attribute: "google.link", value: firstField(firstItem, "g:link", "link") as string }]
          : []),
      ],
      media: mediaForGroup(items),
      variants,
    });
  }

  if (currencies.size > 1) {
    throw new GoogleMerchantFeedInputError(
      "Google Merchant feed imports with mixed currencies are not supported.",
    );
  }

  if (!products.length) {
    throw new GoogleMerchantFeedInputError("Google Merchant feed must contain at least one item.");
  }

  const sourceName = feed.title?.trim() || "Google Merchant Feed";
  const currencyCode = currencies.values().next().value;

  if (!currencyCode) {
    throw new GoogleMerchantFeedInputError("Google Merchant feed item price is required.");
  }

  return {
    source: {
      connectorId: GOOGLE_MERCHANT_FEED_CONNECTOR_ID,
      version: GOOGLE_MERCHANT_FEED_VERSION,
      name: sourceName,
      instanceId: sourceInstanceId,
    },
    channel: sourceChannel({
      name: GOOGLE_MERCHANT_FEED_CHANNEL_NAME,
      slug: GOOGLE_MERCHANT_FEED_CHANNEL_SLUG,
      sourceName,
      sourceInstanceId,
      currencyCode,
    }),
    products,
  };
};

const toFeedInputError = (error: unknown) =>
  error instanceof GoogleMerchantFeedInputError
    ? error
    : new GoogleMerchantFeedInputError("Google Merchant feed could not be read.", {
        cause: error,
      });

export const parseGoogleMerchantRssFeed = Result.fromThrowable(
  readGoogleMerchantRssFeed,
  toFeedInputError,
);

export const mapGoogleMerchantFeedToDraftCatalog = Result.fromThrowable(
  buildDraftCatalog,
  toFeedInputError,
);

export const fetchGoogleMerchantFeed = (value: string) =>
  ResultAsync.fromPromise(downloadGoogleMerchantFeed(value), toFeedInputError);

export const getDraftCatalogFromGoogleMerchantFeedXml = (
  xml: string,
  sourceInstanceId?: string,
): Result<SaleorDraftCatalog, GoogleMerchantFeedInputError> => {
  if (!xml.trim()) {
    return err(new GoogleMerchantFeedInputError("Upload a Google Merchant RSS XML feed file."));
  }

  if (new TextEncoder().encode(xml).byteLength > GOOGLE_MERCHANT_FEED_MAX_BYTES) {
    return err(
      new GoogleMerchantFeedInputError("Google Merchant feed is larger than the 10 MB limit."),
    );
  }

  return parseGoogleMerchantRssFeed(xml).andThen((feed) =>
    mapGoogleMerchantFeedToDraftCatalog(feed, sourceInstanceId),
  );
};

const FEED_DOWNLOAD_ATTEMPTS = 3;

export const getDraftCatalogFromGoogleMerchantFeedUrl = async (
  url: string,
): Promise<Result<SaleorDraftCatalog, GoogleMerchantFeedInputError>> => {
  for (let attempt = 1; ; attempt += 1) {
    const xml = await fetchGoogleMerchantFeed(url);

    if (xml.isOk()) {
      return getDraftCatalogFromGoogleMerchantFeedXml(
        xml.value,
        hashSourceInstance(new URL(url).toString()),
      );
    }

    const retryable = /timed out|returned (429|5\d\d)/i.test(xml.error.message);

    if (!retryable || attempt === FEED_DOWNLOAD_ATTEMPTS) {
      return err(xml.error);
    }

    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** (attempt - 1)));
  }
};
