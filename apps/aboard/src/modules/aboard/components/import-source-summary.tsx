import { Text } from "@saleor/macaw-ui";

import { formatFileSize, PRODUCT_CSV_MAX_BYTES, PRODUCT_FEED_MAX_BYTES } from "../catalog-sources";
import { type SourceOption } from "../ui-types";
import { SourceLogo } from "./source-logo";

type SourceFact = {
  label: string;
  value: string;
};

const getSourceFacts = (source: SourceOption): SourceFact[] => {
  switch (source.id) {
    case "google-merchant-feed":
      return [
        { label: "Format", value: "Google Merchant RSS XML" },
        { label: "Maximum upload", value: formatFileSize(PRODUCT_FEED_MAX_BYTES) },
      ];
    case "woocommerce-csv":
      return [
        { label: "Format", value: "WooCommerce product CSV" },
        { label: "Compatibility", value: "WooCommerce 10.8.1" },
        { label: "Maximum upload", value: formatFileSize(PRODUCT_CSV_MAX_BYTES) },
      ];
    case "product-csv":
      return [
        { label: "Format", value: "Aboard Product CSV v1" },
        { label: "Maximum upload", value: formatFileSize(PRODUCT_CSV_MAX_BYTES) },
      ];
  }
};

export const ImportSourceSummary = ({ source }: { source: SourceOption }) => (
  <aside className="import-source-summary" aria-label={`${source.name} source details`}>
    <div className="import-source-summary-heading">
      <SourceLogo source={source} />
      <div>
        <Text as="p" size={1} color="default2">
          Catalog source
        </Text>
        <Text as="h2" size={4} fontWeight="bold">
          {source.name}
        </Text>
      </div>
    </div>
    <Text as="p" size={2} color="default2" className="import-source-summary-description">
      {source.description}
    </Text>
    <dl className="import-source-facts">
      {getSourceFacts(source).map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  </aside>
);
