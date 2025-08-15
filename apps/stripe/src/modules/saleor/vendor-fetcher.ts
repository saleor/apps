import { err, ok, Result } from "neverthrow";
import { Client } from "urql";

import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

import { FetchVendorByIdDocument, FetchVendorsDocument } from "../../../generated/graphql";

export interface Vendor {
  id: string;
  title: string;
  slug: string;
  stripeAccountId?: string;
  metadata: ReadonlyArray<{ readonly key: string; readonly value: string }>;
  attributes?: ReadonlyArray<{
    readonly attribute: { readonly slug?: string | null };
    readonly values: ReadonlyArray<{
      readonly slug?: string | null;
      readonly value?: string | null;
      readonly name?: string | null;
    }>;
  }>;
}

export class VendorFetcher {
  static FetchError = BaseError.subclass("FetchError", {
    props: {
      _internalName: "VendorFetcher.FetchError",
    },
  });

  readonly client: Pick<Client, "query">;
  private logger = createLogger("VendorFetcher");

  constructor(client: Pick<Client, "query">) {
    this.client = client;
  }

  async fetchVendorById(
    vendorId: string,
  ): Promise<Result<Vendor | null, InstanceType<typeof VendorFetcher.FetchError>>> {
    this.logger.debug("🔍 Querying Saleor GraphQL for vendor", { vendorId });

    const vendorResponse = await this.client
      .query(FetchVendorByIdDocument, { vendorId })
      .toPromise();

    if (vendorResponse.error) {
      this.logger.error("❌ GraphQL query failed", {
        vendorId,
        error: vendorResponse.error.message,
        graphQLErrors: vendorResponse.error.graphQLErrors,
        networkError: vendorResponse.error.networkError,
      });

      return err(
        new VendorFetcher.FetchError("Failed to fetch vendor", {
          cause: vendorResponse.error,
        }),
      );
    }

    if (!vendorResponse.data?.page) {
      this.logger.warn("⚠️ No page found for vendor ID", { vendorId });

      return ok(null);
    }

    const vendor = vendorResponse.data.page;

    // First try to get stripe_account_id from attributes (preferred)
    let stripeAccountId: string | undefined;
    const stripeAccountAttribute = vendor.attributes?.find(
      (attr) => attr.attribute.slug === "stripe_account_id",
    );

    if (stripeAccountAttribute && stripeAccountAttribute.values.length > 0) {
      // Get the first value (attributes can have multiple values, but we expect only one for stripe_account_id)
      const value = stripeAccountAttribute.values[0].value || stripeAccountAttribute.values[0].slug;

      if (value) {
        stripeAccountId = value;
        this.logger.info("Found Stripe account ID in attributes", {
          attributeSlug: stripeAccountAttribute.attribute.slug,
          stripeAccountId,
        });
      }
    }

    // Fallback to metadata if not found in attributes
    if (!stripeAccountId) {
      stripeAccountId = vendor.metadata.find((m) => m.key === "stripe_account_id")?.value;
      if (stripeAccountId) {
        this.logger.info("Found Stripe account ID in metadata (fallback)", {
          stripeAccountId,
        });
      }
    }

    this.logger.info("✅ Vendor page fetched from Saleor", {
      vendorId: vendor.id,
      vendorTitle: vendor.title,
      vendorSlug: vendor.slug,
      metadataCount: vendor.metadata.length,
      metadataKeys: vendor.metadata.map((m) => m.key),
      attributeCount: vendor.attributes?.length || 0,
      attributeSlugs: vendor.attributes?.map((a) => a.attribute.slug).filter(Boolean) || [],
      hasStripeAccountId: !!stripeAccountId,
      stripeAccountId: stripeAccountId || "not_configured",
      stripeAccountSource: stripeAccountAttribute
        ? "attribute"
        : stripeAccountId
        ? "metadata"
        : "none",
    });

    return ok({
      id: vendor.id,
      title: vendor.title,
      slug: vendor.slug,
      stripeAccountId,
      metadata: vendor.metadata,
      attributes: vendor.attributes,
    });
  }

  async fetchVendors(
    pageTypeId: string,
  ): Promise<Result<Vendor[], InstanceType<typeof VendorFetcher.FetchError>>> {
    const vendorsResponse = await this.client
      .query(FetchVendorsDocument, { pageTypeId })
      .toPromise();

    if (vendorsResponse.error) {
      return err(
        new VendorFetcher.FetchError("Failed to fetch vendors", {
          cause: vendorsResponse.error,
        }),
      );
    }

    if (vendorsResponse.data?.pages?.edges) {
      const vendors = vendorsResponse.data.pages.edges.map((edge) => {
        const vendor = edge.node;
        const stripeAccountId = vendor.metadata.find((m) => m.key === "stripe_account_id")?.value;

        return {
          id: vendor.id,
          title: vendor.title,
          slug: vendor.slug,
          stripeAccountId,
          metadata: vendor.metadata,
        };
      });

      return ok(vendors);
    }

    return err(new VendorFetcher.FetchError("Failed to fetch vendors - vendors data missing"));
  }
}
