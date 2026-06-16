import { useQuery } from "urql";

import { ShopVersionDocument } from "@/generated/graphql";

import { supportsCheckoutDeletion } from "./saleor-version";

/**
 * Reads the connected Saleor version once and reports whether `checkoutDelete`
 * (added in 3.23) is available. While the version is loading - and for any store
 * below 3.23 - checkout deletion is reported as unsupported, so the UI fails
 * closed rather than firing a mutation the store cannot handle.
 */
export const useCheckoutDeletionSupport = () => {
  const [{ data, fetching }] = useQuery({ query: ShopVersionDocument });

  const version = data?.shop.version ?? null;

  return {
    fetching,
    version,
    supported: !fetching && supportsCheckoutDeletion(version),
  };
};
