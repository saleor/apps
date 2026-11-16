import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchGoogleMerchantFeed,
  getDraftCatalogFromGoogleMerchantFeedXml,
  GOOGLE_MERCHANT_FEED_MAX_BYTES,
  GoogleMerchantFeedInputError,
  mapGoogleMerchantFeedToDraftCatalog,
  parseGoogleMerchantRssFeed,
} from "./google-merchant-feed";

const feedXml = `<?xml version="1.0" encoding="utf-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Test Feed</title>
    <link>https://example.com</link>
    <description>Catalog</description>
    <item>
      <g:id>TS-S</g:id>
      <g:item_group_id>product-1</g:item_group_id>
      <title>T-Shirt Small</title>
      <g:description>Cotton shirt</g:description>
      <g:link>https://example.com/products/t-shirt</g:link>
      <g:image_link>https://example.com/t-shirt.jpg</g:image_link>
      <g:additional_image_link>https://example.com/t-shirt-side.jpg</g:additional_image_link>
      <g:price>20.00 USD</g:price>
      <g:sale_price>15.00 USD</g:sale_price>
      <g:availability>in_stock</g:availability>
      <g:product_type>Apparel &amp; Accessories</g:product_type>
      <g:google_product_category>212</g:google_product_category>
      <g:brand>Saleor</g:brand>
      <g:size>S</g:size>
      <g:color>Black</g:color>
      <g:shipping>
        <g:price>4.00 USD</g:price>
      </g:shipping>
    </item>
    <item>
      <g:id>TS-M</g:id>
      <g:item_group_id>product-1</g:item_group_id>
      <title>T-Shirt Medium</title>
      <g:link>https://example.com/products/t-shirt</g:link>
      <g:image_link>https://example.com/t-shirt.jpg</g:image_link>
      <g:price>20.00 USD</g:price>
      <g:availability>in_stock</g:availability>
      <g:size>M</g:size>
      <g:color>Black</g:color>
    </item>
  </channel>
</rss>
`;

describe("Google Merchant feed connector", () => {
  it("maps Google feed items into grouped Saleor draft products", () => {
    const catalog = mapGoogleMerchantFeedToDraftCatalog(
      parseGoogleMerchantRssFeed(feedXml)._unsafeUnwrap(),
    )._unsafeUnwrap();

    expect(catalog).toStrictEqual({
      source: {
        connectorId: "google-merchant-feed",
        version: "rss-2.0",
        name: "Test Feed",
        instanceId: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      },
      channel: {
        name: "Google Merchant Feed Import: Test Feed (USD)",
        slug: expect.stringMatching(/^google-merchant-feed-import-usd-[a-f0-9]{10}$/),
        currencyCode: "USD",
      },
      products: [
        {
          id: "google-merchant-feed:product-1",
          name: "T-Shirt Small",
          description: "Cotton shirt",
          productType: "Google Merchant Feed",
          isPublished: true,
          isAvailableForPurchase: true,
          metadata: [
            { attribute: "google.product_type", value: "Apparel & Accessories" },
            { attribute: "google.google_product_category", value: "212" },
            { attribute: "google.brand", value: "Saleor" },
            { attribute: "google.availability", value: "in_stock" },
            { attribute: "google.link", value: "https://example.com/products/t-shirt" },
          ],
          media: [
            { url: "https://example.com/t-shirt.jpg" },
            { url: "https://example.com/t-shirt-side.jpg" },
          ],
          variants: [
            {
              id: "google-merchant-feed:TS-S",
              sku: "TS-S",
              name: "T-Shirt Small",
              attributes: [
                { attribute: "color", value: "Black" },
                { attribute: "size", value: "S" },
              ],
              price: {
                currency: "USD",
                amount: 15,
              },
            },
            {
              id: "google-merchant-feed:TS-M",
              sku: "TS-M",
              name: "T-Shirt Medium",
              attributes: [
                { attribute: "color", value: "Black" },
                { attribute: "size", value: "M" },
              ],
              price: {
                currency: "USD",
                amount: 20,
              },
            },
          ],
        },
      ],
    });
  });

  it("maps the downloadable sample feed shape to the merchant product title", () => {
    const catalog = getDraftCatalogFromGoogleMerchantFeedXml(`
      <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
        <channel>
          <title>GERMAN KABIRSKI</title>
          <item>
            <g:id>39298601386057</g:id>
            <g:title>Fisara Sapphire Ring</g:title>
            <g:image_link>https://cdn.example.com/HM10001-PPW.jpg</g:image_link>
            <g:link>https://example.com/fisara-ring</g:link>
            <g:additional_image_link>https://cdn.example.com/HM10001_01.jpg,https://cdn.example.com/HM10001_02.jpg</g:additional_image_link>
            <g:price>630.00 USD</g:price>
            <g:availability>in_stock</g:availability>
            <g:size>9</g:size>
            <g:item_group_id>2113699971121</g:item_group_id>
          </item>
          <item>
            <g:id>43989416313110</g:id>
            <g:title>Fisara Sapphire Ring</g:title>
            <g:image_link>https://cdn.example.com/HM10001-PPW.jpg</g:image_link>
            <g:link>https://example.com/fisara-ring</g:link>
            <g:price>800.00 USD</g:price>
            <g:availability>in_stock</g:availability>
            <g:size>9.5</g:size>
            <g:item_group_id>2113699971121</g:item_group_id>
          </item>
        </channel>
      </rss>
    `)._unsafeUnwrap();

    expect(catalog.source.name).toBe("GERMAN KABIRSKI");
    expect(catalog.products).toHaveLength(1);
    expect(catalog.products[0]?.name).toBe("Fisara Sapphire Ring");
    expect(catalog.products[0]?.variants).toHaveLength(2);
    expect(catalog.products[0]?.media).toStrictEqual([
      { url: "https://cdn.example.com/HM10001-PPW.jpg" },
      { url: "https://cdn.example.com/HM10001_01.jpg" },
      { url: "https://cdn.example.com/HM10001_02.jpg" },
    ]);
  });

  it("rejects feeds with mixed item currencies", () => {
    const parsed = parseGoogleMerchantRssFeed(`
      <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
        <channel>
          <item><g:id>1</g:id><g:title>One</g:title><g:link>https://example.com/1</g:link><g:image_link>https://example.com/1.jpg</g:image_link><g:availability>in_stock</g:availability><g:price>10.00 USD</g:price></item>
          <item><g:id>2</g:id><g:title>Two</g:title><g:link>https://example.com/2</g:link><g:image_link>https://example.com/2.jpg</g:image_link><g:availability>in_stock</g:availability><g:price>10.00 EUR</g:price></item>
        </channel>
      </rss>
    `)._unsafeUnwrap();

    expect(mapGoogleMerchantFeedToDraftCatalog(parsed)._unsafeUnwrapErr().message).toContain(
      "mixed currencies",
    );
  });

  it("keeps out-of-stock products published but unavailable for purchase", () => {
    const catalog = getDraftCatalogFromGoogleMerchantFeedXml(`
      <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
        <channel><item>
          <g:id>1</g:id>
          <g:title>Sold out item</g:title>
          <g:link>https://example.com/1</g:link>
          <g:image_link>https://example.com/1.jpg</g:image_link>
          <g:availability>out_of_stock</g:availability>
          <g:price>10.00 USD</g:price>
        </item></channel>
      </rss>
    `)._unsafeUnwrap();

    expect(catalog.products[0]).toMatchObject({
      isPublished: true,
      isAvailableForPurchase: false,
    });
  });

  it("rejects missing required item fields before import", () => {
    expect(
      getDraftCatalogFromGoogleMerchantFeedXml(`
        <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
          <channel><item><g:id>1</g:id></item></channel>
        </rss>
      `)._unsafeUnwrapErr().message,
    ).toContain("missing g:title");
  });

  it("maps uploaded feed XML into a draft catalog without fetching", () => {
    const catalog = getDraftCatalogFromGoogleMerchantFeedXml(feedXml)._unsafeUnwrap();

    expect(catalog.products).toHaveLength(1);
    expect(catalog.products[0]?.variants).toHaveLength(2);
  });

  it("rejects empty and oversized uploaded feed XML", () => {
    expect(getDraftCatalogFromGoogleMerchantFeedXml("")._unsafeUnwrapErr().message).toContain(
      "Upload a Google Merchant",
    );
    expect(
      getDraftCatalogFromGoogleMerchantFeedXml(
        "x".repeat(GOOGLE_MERCHANT_FEED_MAX_BYTES + 1),
      )._unsafeUnwrapErr().message,
    ).toContain("10 MB limit");
  });

  it("rejects feeds with a doctype", () => {
    expect(
      parseGoogleMerchantRssFeed(`
        <!DOCTYPE rss [
          <!ENTITY value "expanded">
        ]>
        <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
          <channel><item><g:id>1</g:id></item></channel>
        </rss>
      `)._unsafeUnwrapErr().message,
    ).toContain("must not include a DOCTYPE");
  });

  it("rejects gist-rendered XML samples with text before the RSS root", () => {
    expect(
      parseGoogleMerchantRssFeed(`
        This XML file does not appear to have any style information associated with it.
        <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
          <channel><item><g:id>1</g:id></item></channel>
        </rss>
      `)._unsafeUnwrapErr().message,
    ).toContain("text before <rss>");
  });

  it("wraps malformed XML parser errors with feed guidance", () => {
    expect(
      parseGoogleMerchantRssFeed(`
        <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
          <channel>
            <item>
              <g:id>1</g:id>
              <g:brand>M&S</g:brand>
            </item>
          </channel>
        </rss>
      `)._unsafeUnwrapErr().message,
    ).toContain("Escape bare ampersands");
  });

  afterEach(() => vi.unstubAllGlobals());

  it("rejects non-HTTPS and credential-bearing URLs before fetching", async () => {
    const fetchMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);
    expect(
      (await fetchGoogleMerchantFeed("http://example.com/feed.xml"))._unsafeUnwrapErr().message,
    ).toContain("must use HTTPS");
    expect(
      (
        await fetchGoogleMerchantFeed("https://user:secret@example.com/feed.xml")
      )._unsafeUnwrapErr(),
    ).toBeInstanceOf(GoogleMerchantFeedInputError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches feed XML in the browser without cookies", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(feedXml));

    vi.stubGlobal("fetch", fetchMock);
    expect((await fetchGoogleMerchantFeed("https://example.com/feed.xml"))._unsafeUnwrap()).toBe(
      feedXml,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("https://example.com/feed.xml"),
      expect.objectContaining({ credentials: "omit" }),
    );
  });

  it("directs the user to XML upload when browser access is blocked", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    expect(
      (await fetchGoogleMerchantFeed("https://example.com/feed.xml"))._unsafeUnwrapErr().message,
    ).toContain("choose the XML file instead");
  });

  it("stops downloading oversized feeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("x".repeat(GOOGLE_MERCHANT_FEED_MAX_BYTES + 1))),
    );
    expect(
      (await fetchGoogleMerchantFeed("https://example.com/feed.xml"))._unsafeUnwrapErr().message,
    ).toContain("10 MB limit");
  });
});
