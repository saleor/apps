import { err, ok, Result } from "neverthrow";
import { Client } from "urql";

import { BaseError } from "@/lib/errors";

import { FetchVendorByIdDocument, FetchVendorsDocument } from "../../../generated/graphql";

export interface Vendor {
  id: string;
  title: string;
  slug: string;
  stripeAccountId?: string;
  metadata: Array<{ key: string; value: string }>;
}

export class VendorFetcher {
  static FetchError = BaseError.subclass("FetchError", {
    props: {
      _internalName: "VendorFetcher.FetchError",
    },
  });

  readonly client: Pick<Client, "query">;

  constructor(client: Pick<Client, "query">) {
    this.client = client;
  }

  async fetchVendorById(
    vendorId: string,
  ): Promise<Result<Vendor | null, InstanceType<typeof VendorFetcher.FetchError>>> {
    const vendorResponse = await this.client
      .query(FetchVendorByIdDocument, { vendorId })
      .toPromise();

    if (vendorResponse.error) {
      return err(
        new VendorFetcher.FetchError("Failed to fetch vendor", {
          cause: vendorResponse.error,
        }),
      );
    }

    if (!vendorResponse.data?.page) {
      return ok(null);
    }

    const vendor = vendorResponse.data.page;
    const stripeAccountId = vendor.metadata.find((m) => m.key === "stripe_account_id")?.value;

    return ok({
      id: vendor.id,
      title: vendor.title,
      slug: vendor.slug,
      stripeAccountId,
      metadata: vendor.metadata,
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
