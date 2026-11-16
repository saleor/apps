import { err, ok } from "neverthrow";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as importCatalogModule from "./import-catalog";
import { CatalogImportError, importDraftCatalogToSaleor } from "./import-catalog";
import { createSaleorImportClient, type SaleorImportClient } from "./saleor-import-client";
import { useCatalogImportController } from "./use-catalog-import-controller";

const { state, notifySuccess, notifyError, notifyWarning } = vi.hoisted(() => ({
  state: { saleorApiUrl: "https://store.example/graphql/", token: "initial-token", ready: true },
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  notifyWarning: vi.fn(),
}));

vi.mock("@saleor/app-sdk/app-bridge", () => ({
  actions: {},
  useAppBridge: () => ({ appBridgeState: state, appBridge: { getState: () => state } }),
}));
vi.mock("@saleor/apps-shared/use-dashboard-notification", () => ({
  useDashboardNotification: () => ({ notifySuccess, notifyError, notifyWarning }),
}));
vi.mock("./import-catalog", async (importOriginal) => ({
  ...(await importOriginal<typeof importCatalogModule>()),
  importDraftCatalogToSaleor: vi.fn(),
}));
vi.mock("./saleor-import-client", () => ({
  createSaleorImportClient: vi.fn(() => ({}) as SaleorImportClient),
}));

const csv = "product_id,product_name,sku,price\nshirt,Shirt,SHIRT,10\n";
const file = { name: "products.csv", size: csv.length, text: async () => csv } as File;
let root: Root;
let host: HTMLDivElement;
let controller: ReturnType<typeof useCatalogImportController>;
const Harness = () => {
  controller = useCatalogImportController();

  return null;
};

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("fetch", vi.fn());
  state.token = "initial-token";
  state.saleorApiUrl = "https://store.example/graphql/";
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => {
    root.render(<Harness />);
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
const preview = async () => {
  await act(async () => controller.selectSource("product-csv"));
  await act(async () => controller.handleProductCsvFileChange(file));
  await act(async () => controller.previewSelectedImport());
};

describe("browser catalog import", () => {
  it("reports rejected imports through a Dashboard error toast", async () => {
    await preview();
    vi.mocked(importDraftCatalogToSaleor).mockResolvedValueOnce(
      err(new CatalogImportError.MutationError("Permission denied")),
    );
    await act(async () => controller.startSelectedImport());
    expect(notifyError).toHaveBeenCalledWith("Import failed", "Permission denied");
    expect(controller.canStartSelectedImport).toBe(true);
  });

  it("previews an uploaded file without network access and clears it when the source changes", async () => {
    await preview();
    expect(controller.importPreview).toMatchObject({ productCount: 1, variantCount: 1 });
    expect(fetch).not.toHaveBeenCalled();
    await act(async () => controller.selectSource("google-merchant-feed"));
    expect(controller.importPreview).toBeNull();
    expect(controller.csvFile).toBeNull();
    expect(controller.canStartSelectedImport).toBe(false);
  });

  it("imports the reviewed catalog once, reads renewed Dashboard tokens, and keeps only the current result", async () => {
    await preview();
    let finish!: (value: Awaited<ReturnType<typeof importDraftCatalogToSaleor>>) => void;

    vi.mocked(importDraftCatalogToSaleor).mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    let pending!: Promise<void>;

    await act(async () => {
      pending = controller.startSelectedImport();
      void controller.startSelectedImport();
    });
    expect(importDraftCatalogToSaleor).toHaveBeenCalledTimes(1);
    const [, draft] = vi.mocked(importDraftCatalogToSaleor).mock.calls[0];
    const [clientArgs] = vi.mocked(createSaleorImportClient).mock.calls[0];

    expect(draft.products[0].name).toBe("Shirt");
    expect(clientArgs.saleorApiUrl).toBe(state.saleorApiUrl);
    state.token = "renewed-token";
    expect(clientArgs.getToken()).toBe("renewed-token");
    state.saleorApiUrl = "https://another.example/graphql/";
    expect(clientArgs.getToken()).toBeUndefined();
    state.saleorApiUrl = "https://store.example/graphql/";
    await act(async () => {
      finish(
        ok({
          channel: { id: "channel", created: true },
          createdProducts: 1,
          createdVariants: 1,
          skippedProducts: 0,
          createdAttributes: 0,
          createdProductTypes: 1,
          errors: [],
          failedProducts: [],
        }),
      );
      await pending;
    });
    expect(controller.completedImport?.status).toBe("completed");
    expect(controller.canStartSelectedImport).toBe(false);
    expect(notifySuccess).toHaveBeenCalledOnce();
    expect(fetch).not.toHaveBeenCalled();
    await act(async () => root.unmount());
    root = createRoot(host);
    await act(async () => root.render(<Harness />));
    expect(controller.completedImport).toBeNull();
    expect(controller.selectedImportSource).toBeNull();
  });

  it("invalidates previews when the active Saleor instance changes", async () => {
    await preview();
    state.saleorApiUrl = "https://another.example/graphql/";
    await act(async () => root.render(<Harness />));
    expect(controller.importPreview).toBeNull();
    expect(controller.canStartSelectedImport).toBe(false);
  });
});
