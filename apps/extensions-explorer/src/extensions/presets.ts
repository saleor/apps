import { type ExtensionConfig } from "./domain";

export const PRESETS: { name: string; description: string; extensions: ExtensionConfig[] }[] = [
  {
    name: "Detail page widgets",
    description: "WIDGET target on every mount that supports it",
    extensions: [
      { label: "Product widget", mount: "PRODUCT_DETAILS_WIDGETS", target: "WIDGET" },
      { label: "Order widget", mount: "ORDER_DETAILS_WIDGETS", target: "WIDGET" },
      { label: "Draft order widget", mount: "DRAFT_ORDER_DETAILS_WIDGETS", target: "WIDGET" },
      { label: "Customer widget", mount: "CUSTOMER_DETAILS_WIDGETS", target: "WIDGET" },
      { label: "Collection widget", mount: "COLLECTION_DETAILS_WIDGETS", target: "WIDGET" },
      { label: "Voucher widget", mount: "VOUCHER_DETAILS_WIDGETS", target: "WIDGET" },
      { label: "Gift card widget", mount: "GIFT_CARD_DETAILS_WIDGETS", target: "WIDGET" },
    ],
  },
  {
    name: "Homepage widgets",
    description: "Grid and fullscreen widget on the Dashboard home page",
    extensions: [
      { label: "Home widget (grid)", mount: "HOMEPAGE_WIDGETS", target: "WIDGET" },
      {
        label: "Home widget (fullscreen)",
        mount: "HOMEPAGE_WIDGETS",
        target: "WIDGET",
        fullscreen: true,
      },
    ],
  },
  {
    name: "Product actions",
    description: "Every target available in the product details more-actions menu",
    extensions: [
      { label: "Product popup", mount: "PRODUCT_DETAILS_MORE_ACTIONS", target: "POPUP" },
      { label: "Product app page", mount: "PRODUCT_DETAILS_MORE_ACTIONS", target: "APP_PAGE" },
      { label: "Product new tab", mount: "PRODUCT_DETAILS_MORE_ACTIONS", target: "NEW_TAB" },
    ],
  },
  {
    name: "Command palette",
    description: "SEARCH_ACTION extensions, global and scoped to views",
    extensions: [
      { label: "Global action", mount: "SEARCH_ACTION", target: "POPUP" },
      {
        label: "Order-only action",
        mount: "SEARCH_ACTION",
        target: "APP_PAGE",
        views: ["ORDER_LIST", "ORDER_DETAILS"],
        aliases: ["invoice", "shipment"],
      },
    ],
  },
  {
    name: "POST targets",
    description: "Extensions submitted as a form, with Saleor context in the body",
    extensions: [
      {
        label: "New tab POST",
        mount: "PRODUCT_DETAILS_MORE_ACTIONS",
        target: "NEW_TAB",
        method: "POST",
      },
      { label: "Widget POST", mount: "ORDER_DETAILS_WIDGETS", target: "WIDGET", method: "POST" },
    ],
  },
  {
    name: "Navigation",
    description: "App pages linked from the main Dashboard menu",
    extensions: [
      { label: "Catalog nav", mount: "NAVIGATION_CATALOG", target: "APP_PAGE" },
      { label: "Orders nav", mount: "NAVIGATION_ORDERS", target: "APP_PAGE" },
      { label: "Customers nav", mount: "NAVIGATION_CUSTOMERS", target: "APP_PAGE" },
      { label: "Discounts nav", mount: "NAVIGATION_DISCOUNTS", target: "APP_PAGE" },
      { label: "Translations nav", mount: "NAVIGATION_TRANSLATIONS", target: "APP_PAGE" },
      { label: "Models nav", mount: "NAVIGATION_PAGES", target: "APP_PAGE" },
    ],
  },
  {
    name: "Create buttons",
    description: "Popups mounted next to the create button on list pages",
    extensions: [
      { label: "Create product", mount: "PRODUCT_OVERVIEW_CREATE", target: "POPUP" },
      { label: "Create order", mount: "ORDER_OVERVIEW_CREATE", target: "POPUP" },
      { label: "Create customer", mount: "CUSTOMER_OVERVIEW_CREATE", target: "POPUP" },
    ],
  },
  {
    name: "Translations",
    description: "Popup in the translations more-actions menu",
    extensions: [{ label: "Translate", mount: "TRANSLATIONS_MORE_ACTIONS", target: "POPUP" }],
  },
];

export const DEFAULT_EXTENSIONS = PRESETS[0].extensions;
