import { Box, Button, Input, Modal, Text } from "@saleor/macaw-ui";
import { type MouseEventHandler, type RefObject } from "react";

import { csvSources, formatFileSize, PRODUCT_CSV_MAX_BYTES } from "../catalog-sources";
import { type AvailableSourceId, type CsvValidationIssue, type WooCsvOptions } from "../ui-types";
import { ExternalDocsLink } from "./external-docs-link";
import { FeedSourceInput } from "./feed-source-input";

const csvSchemaRows = [
  ["product_id", "Yes", "", "Groups rows into one product."],
  ["product_name", "Yes", "", "Must match across rows for the same product."],
  ["variant_id", "No", "product_id + sku", "Required when sku is empty."],
  ["sku", "No", "", "Required when variant_id is empty."],
  ["price", "Yes", "", "Use a non-negative number."],
  ["currency", "No", "USD", "Use one currency per import."],
  ["product_type", "No", "Default", "Creates or reuses an Aboard product type."],
  ["category_path", "No", "Imported Products", "Use > separators."],
  ["is_published", "No", "true", "Accepts true/false, yes/no, or 1/0."],
  ["product_attribute:*", "No", "", "Product-level dynamic attribute."],
  ["variant_attribute:*", "No", "", "Variant-level dynamic attribute."],
];

const CsvSchemaReference = () => (
  <div className="schema-reference" id="product-csv-schema">
    <div className="schema-table">
      <div className="schema-row schema-row-heading">
        <span>Column</span>
        <span>Required</span>
        <span>Default</span>
        <span>Notes</span>
      </div>
      {csvSchemaRows.map(([column, required, fallback, notes]) => (
        <div className="schema-row" key={column}>
          <code>{column}</code>
          <span>{required}</span>
          <span>{fallback || "-"}</span>
          <span>{notes}</span>
        </div>
      ))}
    </div>
  </div>
);

const CsvSchemaModal = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <Modal open={open} onChange={onOpenChange}>
    <Modal.Content dialogContentProps={{ "aria-labelledby": "product-csv-schema-title" }}>
      <Box
        backgroundColor="default1"
        borderRadius={4}
        boxShadow="defaultModal"
        display="grid"
        gap={4}
        padding={6}
        position="fixed"
        __left="50%"
        __maxHeight="calc(100vh - 48px)"
        __maxWidth="980px"
        __overflow="auto"
        __top="50%"
        __transform="translate(-50%, -50%)"
        __width="calc(100% - 64px)"
      >
        <div className="schema-modal-heading">
          <div>
            <Text as="h2" id="product-csv-schema-title" size={6} fontWeight="bold">
              Product CSV v1 schema
            </Text>
            <Text as="p" size={2} color="default2">
              Use these columns in the CSV file before previewing the catalog.
            </Text>
          </div>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
        <CsvSchemaReference />
      </Box>
    </Modal.Content>
  </Modal>
);

type SourceDetailsProps = {
  sourceId: AvailableSourceId;
  feedUrl: string;
  feedFile: File | null;
  feedFileInputRef: RefObject<HTMLInputElement>;
  onFeedUrlChange: (url: string) => void;
  onFeedFileChange: (file: File | null) => void;
  csvFile: File | null;
  csvFileInputRef: RefObject<HTMLInputElement>;
  onCsvFileChange: (file: File | null) => void;
  csvSchemaOpen: boolean;
  onCsvSchemaOpenChange: (open: boolean) => void;
  csvValidationErrors: CsvValidationIssue[];
  wooCsvOptions: WooCsvOptions;
  onWooCsvOptionsChange: (options: WooCsvOptions) => void;
  onExternalLinkClick: MouseEventHandler<HTMLAnchorElement>;
};

export const SourceDetails = (props: SourceDetailsProps) => {
  if (props.sourceId === "google-merchant-feed") {
    return (
      <div className="selected-source-detail">
        <FeedSourceInput
          url={props.feedUrl}
          file={props.feedFile}
          inputRef={props.feedFileInputRef}
          onUrlChange={props.onFeedUrlChange}
          onFileChange={props.onFeedFileChange}
        />
      </div>
    );
  }

  const csvSource = csvSources[props.sourceId];

  return (
    <div className="selected-source-detail">
      <div className="csv-format-note">
        {props.sourceId === "woocommerce-csv" ? (
          <Text as="p" size={2} color="default2" className="csv-format-copy">
            Upload a CSV exported from the built-in WooCommerce product CSV importer/exporter. This
            source is frozen to WooCommerce 10.8.1. Choose the store currency and price decimal
            separator below.{" "}
            <ExternalDocsLink
              href="https://woocommerce.com/document/product-csv-importer-exporter/"
              onClick={props.onExternalLinkClick}
            >
              Review the WooCommerce CSV docs
            </ExternalDocsLink>{" "}
            before uploading your file.
          </Text>
        ) : (
          <>
            <Text as="p" size={2} color="default2" className="csv-format-copy">
              Upload a CSV that follows the Product CSV v1 schema. Review the schema reference or{" "}
              <a href="/product-csv-v1-template.csv" download>
                download an example template
              </a>{" "}
              before uploading your file.
            </Text>
            <Button
              type="button"
              variant="secondary"
              className="csv-schema-button"
              aria-haspopup="dialog"
              aria-expanded={props.csvSchemaOpen}
              onClick={() => props.onCsvSchemaOpenChange(!props.csvSchemaOpen)}
            >
              View schema
            </Button>
          </>
        )}
      </div>
      {props.sourceId === "woocommerce-csv" ? (
        <div className="woo-csv-options">
          <Input
            required
            label="Store currency"
            maxLength={3}
            placeholder="USD"
            value={props.wooCsvOptions.currencyCode}
            onChange={(event) =>
              props.onWooCsvOptionsChange({
                ...props.wooCsvOptions,
                currencyCode: event.target.value.toUpperCase(),
              })
            }
          />
          <label className="woo-csv-select">
            <span>Price decimal separator</span>
            <select
              value={props.wooCsvOptions.decimalSeparator}
              onChange={(event) =>
                props.onWooCsvOptionsChange({
                  ...props.wooCsvOptions,
                  decimalSeparator: event.target.value as WooCsvOptions["decimalSeparator"],
                })
              }
            >
              <option value=".">Dot (12.50)</option>
              <option value=",">Comma (12,50)</option>
            </select>
          </label>
        </div>
      ) : null}
      <div className="file-input">
        <div className="file-input-copy">
          <Text as="p" size={2} fontWeight="bold">
            {csvSource.label} file
          </Text>
          <Text as="p" size={2} color="default2" className="file-input-status">
            {props.csvFile
              ? `${props.csvFile.name} (${formatFileSize(props.csvFile.size)}) selected.`
              : "CSV, up to 5 MB."}
          </Text>
        </div>
        <input
          ref={props.csvFileInputRef}
          accept=".csv,text/csv"
          className="file-input-native"
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;

            if (file && file.size > PRODUCT_CSV_MAX_BYTES) {
              event.target.value = "";
            }

            props.onCsvFileChange(file);
          }}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => props.csvFileInputRef.current?.click()}
        >
          Choose CSV file
        </Button>
      </div>
      {props.sourceId === "product-csv" ? (
        <CsvSchemaModal open={props.csvSchemaOpen} onOpenChange={props.onCsvSchemaOpenChange} />
      ) : null}
      {props.csvValidationErrors.length ? (
        <div className="validation-list">
          <div className="preview-list-summary">Validation errors</div>
          {props.csvValidationErrors.slice(0, 12).map((issue, index) => (
            <div className="validation-row" key={`${issue.row}-${issue.column}-${index}`}>
              <strong>
                Row {issue.row}, {issue.column}
              </strong>
              <span>{issue.message}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
