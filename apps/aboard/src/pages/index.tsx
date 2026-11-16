import { Box, Text } from "@saleor/macaw-ui";
import { type NextPage } from "next";

import { sourceOptions } from "@/modules/aboard/catalog-sources";
import { ImportFlow } from "@/modules/aboard/components/import-flow";
import { ImportSourceSelect } from "@/modules/aboard/components/import-source-select";
import { PageHeader } from "@/modules/aboard/components/page-header";
import { SourceDetails } from "@/modules/aboard/components/source-details";
import { SourcePicker } from "@/modules/aboard/components/source-picker";
import { useCatalogImportController } from "@/modules/aboard/use-catalog-import-controller";

const IndexPage: NextPage = () => {
  const controller = useCatalogImportController();
  const selectedSource = sourceOptions.find(
    (source) => source.id === controller.selectedImportSource,
  );

  return (
    <main className="aboard-page">
      <PageHeader
        title={selectedSource ? "New import" : "Product import"}
        sourceName={selectedSource?.name}
        showBack={Boolean(selectedSource) && controller.busy === null}
        onBack={controller.returnToIndex}
      />
      <Box className="aboard-shell">
        {!controller.canUseDashboardApi ? (
          <Text as="p" size={2}>
            Open Aboard from Saleor Dashboard to import into your store.
          </Text>
        ) : null}
        {selectedSource ? (
          <ImportFlow
            source={selectedSource}
            preview={controller.importPreview}
            completedImport={controller.completedImport}
            busy={controller.busy}
            canPreview={controller.canPreviewSelectedImport}
            canImport={controller.canStartSelectedImport}
            onPreview={controller.previewSelectedImport}
            onImport={controller.startSelectedImport}
            sourceControls={
              <div className="source-step-stack">
                <ImportSourceSelect
                  selectedSourceId={selectedSource.id}
                  onChange={controller.handleImportSourceChange}
                />
                <SourceDetails
                  sourceId={selectedSource.id}
                  feedUrl={controller.feedUrl}
                  feedFile={controller.feedFile}
                  feedFileInputRef={controller.feedFileInputRef}
                  onFeedUrlChange={controller.handleProductFeedUrlChange}
                  onFeedFileChange={controller.handleProductFeedFileChange}
                  csvFile={controller.csvFile}
                  csvFileInputRef={controller.csvFileInputRef}
                  onCsvFileChange={controller.handleProductCsvFileChange}
                  csvSchemaOpen={controller.csvSchemaOpen}
                  onCsvSchemaOpenChange={controller.setCsvSchemaOpen}
                  csvValidationErrors={controller.csvValidationErrors}
                  wooCsvOptions={controller.wooCsvOptions}
                  onWooCsvOptionsChange={controller.updateWooCsvOptions}
                  onExternalLinkClick={controller.handleLinkClick}
                />
              </div>
            }
          />
        ) : (
          <SourcePicker
            onSelect={controller.selectSource}
            sources={sourceOptions}
            title="Choose a catalog source"
            description="Preview and import a catalog. Files and results stay in this tab and are cleared when you leave."
          />
        )}
      </Box>
    </main>
  );
};

export default IndexPage;
