import { type SourceOption } from "./ui-types";

export const PRODUCT_FEED_MAX_BYTES = 10 * 1024 * 1024;
export const PRODUCT_CSV_MAX_BYTES = 5 * 1024 * 1024;

export const sourceOptions: SourceOption[] = [
  {
    id: "woocommerce-csv",
    name: "WooCommerce CSV",
    description: "Upload a WooCommerce 10.8.1 product CSV export.",
    availability: "available",
    logo: "woocommerce",
  },
  {
    id: "google-merchant-feed",
    name: "Google Merchant feed",
    description: "Import products and variants from a Google Merchant Center RSS feed.",
    availability: "available",
    logo: "feed",
  },
  {
    id: "product-csv",
    name: "Product CSV",
    description: "Upload a Product CSV v1 file using Aboard's fixed schema.",
    availability: "available",
    logo: "csv",
  },
];

export const csvSources = {
  "product-csv": { label: "Product CSV" },
  "woocommerce-csv": { label: "WooCommerce CSV" },
} as const;

export const connectorTypeLabel = (connectorId: string) =>
  sourceOptions.find((source) => source.id === connectorId)?.name ?? connectorId;

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
