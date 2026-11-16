import { Button, Text } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

import {
  type BusyState,
  type ImportPreview,
  type ImportSession,
  type SourceOption,
} from "../ui-types";
import { ImportSourceSummary } from "./import-source-summary";

const Metric = ({ label, value }: { label: string; value: string | number }) => (
  <div className="metric-card">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export const ImportFlow = ({
  source,
  sourceControls,
  preview,
  completedImport,
  busy,
  canPreview,
  canImport,
  onPreview,
  onImport,
}: {
  source: SourceOption;
  sourceControls: ReactNode;
  preview: ImportPreview | null;
  completedImport: ImportSession | null;
  busy: BusyState;
  canPreview: boolean;
  canImport: boolean;
  onPreview: () => void;
  onImport: () => void;
}) => {
  const activeStep =
    canImport || busy === "import" || completedImport
      ? 3
      : canPreview || busy === "preview" || preview
      ? 2
      : 1;
  const stepClassName = (step: number) =>
    `import-step import-step-${
      step === activeStep ? "active" : step < activeStep ? "complete" : "disabled"
    }`;

  return (
    <section className="app-section app-section-primary">
      <div className="section-copy">
        <ImportSourceSummary source={source} />
      </div>
      <div className="section-content">
        <div className="app-card form-stack import-workflow-card">
          <div className="card-heading import-workflow-header">
            <div>
              <Text as="h3" size={5} fontWeight="bold">
                Catalog import
              </Text>
              <Text as="p" size={2} color="default2">
                Import a feed or file directly from your browser.
              </Text>
            </div>
          </div>

          <div
            className={`${stepClassName(1)} import-step-source`}
            data-state={activeStep === 1 ? "active" : "complete"}
          >
            <Text as="p" size={2} fontWeight="bold">
              1. Import from
            </Text>
            <fieldset
              disabled={busy !== null}
              style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
            >
              {sourceControls}
            </fieldset>
          </div>

          <div
            aria-disabled={activeStep < 2}
            className={stepClassName(2)}
            data-state={activeStep === 2 ? "active" : activeStep > 2 ? "complete" : "disabled"}
          >
            <div className="import-step-heading">
              <div>
                <Text as="p" size={2} fontWeight="bold">
                  2. Preview catalog
                </Text>
                <Text as="p" size={2} color="default2">
                  Check product counts and samples. The import uses this preview.
                </Text>
              </div>
              <Button type="button" variant="secondary" disabled={!canPreview} onClick={onPreview}>
                {busy === "preview"
                  ? "Previewing…"
                  : preview
                  ? "Refresh preview"
                  : "Preview catalog"}
              </Button>
            </div>

            {preview ? (
              <>
                <div className="metrics">
                  <Metric label="Products" value={preview.productCount} />
                  <Metric label="Variants" value={preview.variantCount} />
                  <Metric label="Currency" value={preview.channel.currencyCode} />
                  <Metric label="Channel" value={preview.channel.slug} />
                </div>
                <div className="preview-list">
                  <div className="preview-list-summary">
                    Showing {preview.exampleProducts.length} of {preview.productCount} products from
                    this preview.
                  </div>
                  {preview.exampleProducts.map((product) => (
                    <div className="preview-row" key={product.id}>
                      <span>{product.name}</span>
                      <small>
                        {product.productType || "Default"} · {product.variantCount} variants
                      </small>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="import-preview-empty">
                <Text as="p" size={2} color="default2">
                  Preview the catalog to see what will be imported.
                </Text>
              </div>
            )}
          </div>

          <div
            aria-disabled={activeStep < 3}
            className={stepClassName(3)}
            data-state={activeStep === 3 ? "active" : "disabled"}
          >
            <div className="import-step-heading">
              <div>
                <Text as="p" size={2} fontWeight="bold">
                  3. Import catalog
                </Text>
                <Text as="p" size={2} color="default2">
                  Import the reviewed catalog into Saleor. Keep this tab open until it finishes.
                </Text>
              </div>
              <Button type="button" disabled={!canImport} onClick={onImport}>
                {busy === "import" ? "Importing…" : "Import catalog"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
