import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { type Result } from "neverthrow";
import { type MouseEventHandler, useEffect, useRef, useState } from "react";

import { PRODUCT_CSV_MAX_BYTES, PRODUCT_FEED_MAX_BYTES } from "./catalog-sources";
import {
  getDraftCatalogFromGoogleMerchantFeedUrl,
  getDraftCatalogFromGoogleMerchantFeedXml,
  type GoogleMerchantFeedInputError,
} from "./connectors/google-merchant-feed";
import { parseProductCsvCatalog, ProductCsvValidationError } from "./connectors/product-csv";
import {
  parseWoocommerceCsvCatalog,
  parseWoocommerceCsvOptions,
  WoocommerceCsvValidationError,
} from "./connectors/woocommerce-csv";
import { importDraftCatalogToSaleor } from "./import-catalog";
import { createSaleorImportClient } from "./saleor-import-client";
import { type SaleorDraftCatalog } from "./types";
import {
  type AvailableSourceId,
  type BusyState,
  type CsvValidationIssue,
  type ImportPreview,
  type ImportSession,
  type ImportSourceSelectValue,
  type WooCsvOptions,
} from "./ui-types";
import { type DraftCatalogValidationError, validateDraftCatalog } from "./validate-draft-catalog";

type DraftCatalogError =
  | GoogleMerchantFeedInputError
  | ProductCsvValidationError
  | WoocommerceCsvValidationError
  | DraftCatalogValidationError;

export const useCatalogImportController = () => {
  const { appBridgeState, appBridge } = useAppBridge();
  const { notifySuccess, notifyError, notifyWarning } = useDashboardNotification();
  const [selectedImportSource, setSelectedImportSource] = useState<AvailableSourceId | null>(null);
  const [feedUrl, setFeedUrl] = useState("");
  const [feedFile, setFeedFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvSchemaOpen, setCsvSchemaOpen] = useState(false);
  const [wooCsvOptions, setWooCsvOptions] = useState<WooCsvOptions>({
    currencyCode: "USD",
    decimalSeparator: ".",
  });
  const [csvValidationErrors, setCsvValidationErrors] = useState<CsvValidationIssue[]>([]);
  const [catalog, setCatalog] = useState<SaleorDraftCatalog | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [completedImport, setCompletedImport] = useState<ImportSession | null>(null);
  const [busy, setBusy] = useState<BusyState>(null);
  const operation = useRef<AbortController | null>(null);
  const feedFileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const currentBridgeState = useRef(appBridgeState);

  currentBridgeState.current = appBridgeState;

  useEffect(
    () => () => {
      operation.current?.abort();
    },
    [],
  );
  useEffect(() => {
    operation.current?.abort();
    operation.current = null;
    setBusy(null);
    setCatalog(null);
    setImportPreview(null);
    setCompletedImport(null);
  }, [appBridgeState?.saleorApiUrl]);
  useEffect(() => {
    if (busy !== "import") return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warn);

    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  const resetPreview = () => {
    setCatalog(null);
    setImportPreview(null);
    setCompletedImport(null);
    setCsvValidationErrors([]);
  };
  const handleProductFeedUrlChange = (url: string) => {
    resetPreview();
    setFeedUrl(url);
    setFeedFile(null);
    if (feedFileInputRef.current) feedFileInputRef.current.value = "";
  };
  const selectFile = (file: File | null, kind: "feed" | "csv") => {
    resetPreview();
    const limit = kind === "feed" ? PRODUCT_FEED_MAX_BYTES : PRODUCT_CSV_MAX_BYTES;
    const validFile = file && file.size <= limit ? file : null;

    if (kind === "feed") setFeedFile(validFile);
    else setCsvFile(validFile);
    if (file && !validFile)
      notifyError("File too large", `Choose a file smaller than ${kind === "feed" ? 10 : 5} MB.`);
  };
  const updateWooCsvOptions = (options: WooCsvOptions) => {
    resetPreview();
    setWooCsvOptions(options);
  };
  const selectSource = (source: AvailableSourceId | null) => {
    if (operation.current) return;
    resetPreview();
    setSelectedImportSource(source);
    setFeedUrl("");
    setFeedFile(null);
    setCsvFile(null);
    setCsvSchemaOpen(false);
  };
  const canUseDashboardApi = Boolean(appBridgeState?.saleorApiUrl && appBridgeState.token);
  const canPreviewSelectedImport =
    busy === null &&
    Boolean(
      selectedImportSource === "google-merchant-feed"
        ? feedFile || feedUrl.trim()
        : csvFile &&
            (selectedImportSource !== "woocommerce-csv" ||
              /^[A-Za-z]{3}$/.test(wooCsvOptions.currencyCode.trim())),
    );

  const readSelectedDraft = async (): Promise<Result<
    SaleorDraftCatalog,
    DraftCatalogError
  > | null> => {
    if (selectedImportSource === "google-merchant-feed") {
      const draft: Result<SaleorDraftCatalog, DraftCatalogError> = feedFile
        ? getDraftCatalogFromGoogleMerchantFeedXml(await feedFile.text())
        : await getDraftCatalogFromGoogleMerchantFeedUrl(feedUrl.trim());

      return draft.andThen(validateDraftCatalog);
    }

    if (!csvFile) return null;
    const content = await csvFile.text();
    const draft: Result<SaleorDraftCatalog, DraftCatalogError> =
      selectedImportSource === "woocommerce-csv"
        ? parseWoocommerceCsvOptions(wooCsvOptions).andThen((options) =>
            parseWoocommerceCsvCatalog(content, options, { fileName: csvFile.name }),
          )
        : parseProductCsvCatalog(content, { fileName: csvFile.name });

    return draft.andThen(validateDraftCatalog);
  };

  const previewSelectedImport = async () => {
    if (!canPreviewSelectedImport || operation.current) return;
    const controller = new AbortController();

    operation.current = controller;
    resetPreview();
    setBusy("preview");
    try {
      const draftResult = await readSelectedDraft();

      if (controller.signal.aborted || !draftResult) return;
      if (draftResult.isErr()) {
        const error = draftResult.error;

        if (
          error instanceof ProductCsvValidationError ||
          error instanceof WoocommerceCsvValidationError
        )
          setCsvValidationErrors(error.issues);
        notifyError("Preview failed", error.message);

        return;
      }
      const draft = draftResult.value;

      setCatalog(draft);
      setImportPreview({
        source: { name: draft.source.name, version: draft.source.version },
        channel: draft.channel,
        productCount: draft.products.length,
        variantCount: draft.products.reduce(
          (count, product) => count + (product.variants?.length ?? 0),
          0,
        ),
        exampleProducts: draft.products.slice(0, 5).map((product) => ({
          id: product.id,
          name: product.name,
          productType: product.productType,
          variantCount: product.variants?.length ?? 0,
        })),
      });
    } catch (error) {
      if (controller.signal.aborted) return;
      notifyError("Preview failed", error instanceof Error ? error.message : String(error));
    } finally {
      if (operation.current === controller) {
        operation.current = null;
        setBusy(null);
      }
    }
  };

  const startSelectedImport = async () => {
    if (!catalog || !canUseDashboardApi || operation.current) return;
    const bridgeState = appBridge?.getState() ?? currentBridgeState.current;

    if (!bridgeState?.saleorApiUrl || !bridgeState.token) return;
    const saleorApiUrl = bridgeState.saleorApiUrl;
    const controller = new AbortController();

    operation.current = controller;
    setBusy("import");
    setCompletedImport(null);
    try {
      const client = createSaleorImportClient({
        saleorApiUrl,
        getToken: () => {
          const latest = appBridge?.getState() ?? currentBridgeState.current;

          return latest?.saleorApiUrl === saleorApiUrl ? latest.token : undefined;
        },
        signal: controller.signal,
      });
      const imported = await importDraftCatalogToSaleor(client, catalog);

      if (controller.signal.aborted) return;
      if (imported.isErr()) {
        notifyError("Import failed", imported.error.message);

        return;
      }
      const result = imported.value;
      const now = new Date().toISOString();
      const status =
        result.errors.length === 0
          ? "completed"
          : result.createdProducts + result.skippedProducts > 0
          ? "partial"
          : "failed";

      setCompletedImport({
        id: crypto.randomUUID(),
        connectorId: catalog.source.connectorId,
        status,
        createdAt: now,
        updatedAt: now,
        result: {
          ...result,
          catalog: {
            sourceName: catalog.source.name,
            products: catalog.products.length,
            variants: catalog.products.reduce(
              (count, product) => count + (product.variants?.length ?? 0),
              0,
            ),
            channelSlug: catalog.channel.slug,
          },
        },
      });
      setCatalog(null);
      setImportPreview(null);
      if (status === "completed")
        notifySuccess(
          "Import completed",
          `${result.createdProducts} products and ${result.createdVariants} variants created. ${result.skippedProducts} existing products skipped.`,
        );
      else if (status === "partial")
        notifyWarning(
          "Import partially completed",
          `${result.createdProducts} products created, ${result.skippedProducts} skipped. ${result.errors.length} errors.`,
        );
      else notifyError("Import failed", [...new Set(result.errors)].join("; "));
    } catch (error) {
      if (!controller.signal.aborted)
        notifyError("Import failed", error instanceof Error ? error.message : String(error));
    } finally {
      if (operation.current === controller) {
        operation.current = null;
        setBusy(null);
      }
    }
  };
  const handleLinkClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (appBridgeState?.ready) {
      event.preventDefault();
      void appBridge?.dispatch(
        actions.Redirect({ newContext: true, to: event.currentTarget.href }),
      );
    }
  };

  return {
    selectedImportSource,
    feedUrl,
    feedFile,
    csvFile,
    csvSchemaOpen,
    setCsvSchemaOpen,
    wooCsvOptions,
    csvValidationErrors,
    importPreview,
    completedImport,
    busy,
    feedFileInputRef,
    csvFileInputRef,
    canUseDashboardApi,
    canPreviewSelectedImport,
    canStartSelectedImport: Boolean(catalog && canUseDashboardApi && busy === null),
    handleProductFeedUrlChange,
    handleProductFeedFileChange: (file: File | null) => selectFile(file, "feed"),
    handleProductCsvFileChange: (file: File | null) => selectFile(file, "csv"),
    updateWooCsvOptions,
    selectSource,
    handleImportSourceChange: (value: ImportSourceSelectValue) =>
      selectSource(value.replace("source:", "") as AvailableSourceId),
    returnToIndex: () => selectSource(null),
    previewSelectedImport,
    startSelectedImport,
    handleLinkClick,
  };
};
