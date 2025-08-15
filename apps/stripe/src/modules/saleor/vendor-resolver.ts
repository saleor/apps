import { ok, Result } from "neverthrow";
import { Client } from "urql";

import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

import { Vendor, VendorFetcher } from "./vendor-fetcher";

export interface VendorResolutionResult {
  vendor: Vendor;
  stripeAccountId: string;
  resolutionMethod: "vendor-specific" | "channel-based" | "default";
}

export class VendorResolver {
  static ResolutionError = BaseError.subclass("ResolutionError", {
    props: {
      _internalName: "VendorResolver.ResolutionError",
    },
  });

  private vendorFetcher: VendorFetcher;
  private logger = createLogger("VendorResolver");

  constructor(client: Pick<Client, "query">) {
    this.vendorFetcher = new VendorFetcher(client);
  }

  /**
   * Extract vendor ID from order metadata
   */
  private extractVendorIdFromOrder(
    orderMetadata: Array<{ key: string; value: string }>,
  ): string | null {
    const vendorMetadata = orderMetadata.find((m) => m.key === "vendor_id");
    const vendorId = vendorMetadata?.value || null;

    this.logger.debug("🔎 Extracting vendor ID from order metadata", {
      totalMetadataFields: orderMetadata.length,
      metadataKeys: orderMetadata.map((m) => m.key),
      vendorIdFound: !!vendorId,
      vendorId,
    });

    return vendorId;
  }

  /**
   * Resolve vendor and Stripe account ID for a payment
   * Priority: Vendor-specific → Channel-based → Default
   */
  async resolveVendorForPayment(args: {
    orderMetadata: Array<{ key: string; value: string }>;
    channelId: string;
    defaultStripeConfigId?: string;
  }): Promise<
    Result<VendorResolutionResult | null, InstanceType<typeof VendorResolver.ResolutionError>>
  > {
    const {
      orderMetadata,
      channelId: _channelId,
      defaultStripeConfigId: _defaultStripeConfigId,
    } = args;

    // 1. Try vendor-specific resolution
    const vendorId = this.extractVendorIdFromOrder(orderMetadata);

    if (vendorId) {
      this.logger.info("🏪 Fetching vendor data from Saleor", { vendorId });

      const vendorResult = await this.vendorFetcher.fetchVendorById(vendorId);

      if (vendorResult.isErr()) {
        this.logger.error("❌ Failed to fetch vendor data", {
          vendorId,
          error: vendorResult.error.message,
        });
      } else if (vendorResult.value) {
        const vendor = vendorResult.value;

        this.logger.info("📦 Vendor data fetched successfully", {
          vendorId: vendor.id,
          vendorTitle: vendor.title,
          hasStripeAccountId: !!vendor.stripeAccountId,
          stripeAccountId: vendor.stripeAccountId,
        });

        if (vendor.stripeAccountId) {
          this.logger.info("💳 Vendor has Stripe account configured", {
            vendorId: vendor.id,
            stripeAccountId: vendor.stripeAccountId,
          });

          return ok({
            vendor,
            stripeAccountId: vendor.stripeAccountId,
            resolutionMethod: "vendor-specific",
          });
        } else {
          this.logger.warn("⚠️ Vendor found but no Stripe account ID configured", {
            vendorId: vendor.id,
            vendorTitle: vendor.title,
          });
        }
      } else {
        this.logger.warn("⚠️ Vendor not found in Saleor", { vendorId });
      }
    } else {
      this.logger.debug("ℹ️ No vendor_id in order metadata", {
        availableMetadataKeys: orderMetadata.map((m) => m.key),
      });
    }

    /*
     * 2. Fall back to channel-based resolution (existing logic)
     * This would use the existing channel-to-stripe-config mapping
     * For now, we'll return null to indicate no vendor-specific config found
     * The existing payment processing logic will handle channel-based fallback
     */

    return ok(null);
  }

  /**
   * Get all available vendors for UI selection
   */
  async getAvailableVendors(
    pageTypeId: string,
  ): Promise<Result<Vendor[], InstanceType<typeof VendorResolver.ResolutionError>>> {
    return this.vendorFetcher.fetchVendors(pageTypeId);
  }
}
