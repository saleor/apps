import {
  type AppExtension,
  type AppExtensionTarget,
  type AppExtensionView,
} from "@saleor/app-sdk/types";

/**
 * Mirrors Dashboard's `src/extensions/domain/*` zod schemas, which are the actual
 * validator an installed manifest is checked against. Keep in sync with:
 * - app-extension-manifest-available-mounts.ts
 * - app-extension-manifest-options.ts
 * - app-extension-manifest.ts
 */

export const MOUNT_GROUPS = {
  Product: [
    "PRODUCT_OVERVIEW_CREATE",
    "PRODUCT_OVERVIEW_MORE_ACTIONS",
    "PRODUCT_DETAILS_MORE_ACTIONS",
    "PRODUCT_DETAILS_WIDGETS",
  ],
  Order: [
    "ORDER_OVERVIEW_CREATE",
    "ORDER_OVERVIEW_MORE_ACTIONS",
    "ORDER_DETAILS_MORE_ACTIONS",
    "ORDER_DETAILS_WIDGETS",
  ],
  "Draft order": [
    "DRAFT_ORDER_OVERVIEW_CREATE",
    "DRAFT_ORDER_OVERVIEW_MORE_ACTIONS",
    "DRAFT_ORDER_DETAILS_MORE_ACTIONS",
    "DRAFT_ORDER_DETAILS_WIDGETS",
  ],
  Customer: [
    "CUSTOMER_OVERVIEW_CREATE",
    "CUSTOMER_OVERVIEW_MORE_ACTIONS",
    "CUSTOMER_DETAILS_MORE_ACTIONS",
    "CUSTOMER_DETAILS_WIDGETS",
  ],
  Collection: [
    "COLLECTION_OVERVIEW_CREATE",
    "COLLECTION_OVERVIEW_MORE_ACTIONS",
    "COLLECTION_DETAILS_MORE_ACTIONS",
    "COLLECTION_DETAILS_WIDGETS",
  ],
  Category: [
    "CATEGORY_OVERVIEW_CREATE",
    "CATEGORY_OVERVIEW_MORE_ACTIONS",
    "CATEGORY_DETAILS_MORE_ACTIONS",
  ],
  "Gift card": [
    "GIFT_CARD_OVERVIEW_CREATE",
    "GIFT_CARD_OVERVIEW_MORE_ACTIONS",
    "GIFT_CARD_DETAILS_MORE_ACTIONS",
    "GIFT_CARD_DETAILS_WIDGETS",
  ],
  Voucher: [
    "VOUCHER_OVERVIEW_CREATE",
    "VOUCHER_OVERVIEW_MORE_ACTIONS",
    "VOUCHER_DETAILS_MORE_ACTIONS",
    "VOUCHER_DETAILS_WIDGETS",
  ],
  Discount: [
    "DISCOUNT_OVERVIEW_CREATE",
    "DISCOUNT_OVERVIEW_MORE_ACTIONS",
    "DISCOUNT_DETAILS_MORE_ACTIONS",
  ],
  Model: ["PAGE_OVERVIEW_CREATE", "PAGE_OVERVIEW_MORE_ACTIONS", "PAGE_DETAILS_MORE_ACTIONS"],
  "Model type": [
    "PAGE_TYPE_OVERVIEW_CREATE",
    "PAGE_TYPE_OVERVIEW_MORE_ACTIONS",
    "PAGE_TYPE_DETAILS_MORE_ACTIONS",
  ],
  Menu: ["MENU_OVERVIEW_CREATE", "MENU_OVERVIEW_MORE_ACTIONS", "MENU_DETAILS_MORE_ACTIONS"],
  Navigation: [
    "NAVIGATION_CATALOG",
    "NAVIGATION_ORDERS",
    "NAVIGATION_CUSTOMERS",
    "NAVIGATION_DISCOUNTS",
    "NAVIGATION_TRANSLATIONS",
    "NAVIGATION_PAGES",
  ],
  Translations: ["TRANSLATIONS_MORE_ACTIONS"],
  Homepage: ["HOMEPAGE_WIDGETS"],
  "Command palette": ["SEARCH_ACTION"],
} as const;

export type Mount = (typeof MOUNT_GROUPS)[keyof typeof MOUNT_GROUPS][number];

export const ALL_MOUNTS = Object.values(MOUNT_GROUPS).flat() as readonly Mount[];

export const TARGETS = ["POPUP", "APP_PAGE", "NEW_TAB", "WIDGET"] as const;

/** Only these mounts render a statically embedded iframe. */
export const WIDGET_MOUNTS: readonly Mount[] = [
  "ORDER_DETAILS_WIDGETS",
  "PRODUCT_DETAILS_WIDGETS",
  "VOUCHER_DETAILS_WIDGETS",
  "DRAFT_ORDER_DETAILS_WIDGETS",
  "GIFT_CARD_DETAILS_WIDGETS",
  "CUSTOMER_DETAILS_WIDGETS",
  "COLLECTION_DETAILS_WIDGETS",
  "HOMEPAGE_WIDGETS",
];

/** app-sdk ships the type only, so the runtime list lives here - `satisfies` keeps it honest. */
export const VIEWS = [
  "PRODUCT_LIST",
  "PRODUCT_DETAILS",
  "ORDER_LIST",
  "ORDER_DETAILS",
  "DRAFT_ORDER_LIST",
  "DRAFT_ORDER_DETAILS",
  "CUSTOMER_LIST",
  "CUSTOMER_DETAILS",
  "COLLECTION_LIST",
  "COLLECTION_DETAILS",
  "CATEGORY_LIST",
  "CATEGORY_DETAILS",
  "GIFT_CARD_LIST",
  "GIFT_CARD_DETAILS",
  "VOUCHER_LIST",
  "VOUCHER_DETAILS",
  "DISCOUNT_LIST",
  "DISCOUNT_DETAILS",
  "PAGE_LIST",
  "PAGE_DETAILS",
  "PAGE_TYPE_LIST",
  "PAGE_TYPE_DETAILS",
  "MENU_LIST",
  "MENU_DETAILS",
  "CHANNEL_DETAILS",
] as const satisfies readonly AppExtensionView[];

export type View = (typeof VIEWS)[number];

export type ExtensionConfig = {
  label: string;
  /** Left empty in the configurator = derived from the label, see `defaultIdentifier`. */
  identifier?: string;
  mount: Mount;
  target: AppExtensionTarget;
  /** Only for NEW_TAB / WIDGET targets. */
  method?: "GET" | "POST";
  /** Only for HOMEPAGE_WIDGETS + WIDGET. */
  fullscreen?: boolean;
  /** Only for SEARCH_ACTION. Empty = available in every view. */
  views?: View[];
  /** Only for SEARCH_ACTION. */
  aliases?: string[];
  /**
   * Hand-edited manifest entry (pencil icon in the configurator). When set it is
   * emitted verbatim, so the playground can serve shapes this app doesn't model yet.
   */
  raw?: Record<string, unknown>;
};

export const targetsForMount = (mount: Mount): readonly AppExtensionTarget[] =>
  WIDGET_MOUNTS.includes(mount) ? TARGETS : TARGETS.filter((t) => t !== "WIDGET");

/** Which option controls are meaningful for a given mount/target pair. */
export const optionFields = (mount: Mount, target: AppExtensionTarget) => ({
  method: target === "NEW_TAB" || target === "WIDGET",
  fullscreen: target === "WIDGET" && mount === "HOMEPAGE_WIDGETS",
  views: mount === "SEARCH_ACTION",
  aliases: mount === "SEARCH_ACTION",
});

/**
 * Drops options that don't apply to the current mount/target and falls back to a
 * valid target, so editing one field can never leave the row invalid.
 */
export const normalize = (e: ExtensionConfig): ExtensionConfig => {
  const target = targetsForMount(e.mount).includes(e.target) ? e.target : "POPUP";
  const fields = optionFields(e.mount, target);

  return {
    label: e.label,
    ...(e.identifier?.trim() ? { identifier: e.identifier } : {}),
    mount: e.mount,
    target,
    ...(fields.method && e.method ? { method: e.method } : {}),
    ...(fields.fullscreen && e.fullscreen ? { fullscreen: true } : {}),
    ...(fields.views && e.views?.length ? { views: e.views } : {}),
    ...(fields.aliases && e.aliases?.length ? { aliases: e.aliases } : {}),
  };
};

/**
 * Trust boundary: configs arrive base64-encoded in the manifest URL, so anything
 * can be in there. Returns the first problem, or null when valid.
 */
export const validate = (e: ExtensionConfig): string | null => {
  /** Raw entries are intentionally unchecked - that's the point of editing them by hand. */
  if (e?.raw) return null;
  if (!e?.label?.trim()) return "Label is required";
  if (!ALL_MOUNTS.includes(e.mount)) return `Unknown mount "${e.mount}"`;
  if (!targetsForMount(e.mount).includes(e.target))
    return `Target ${e.target} is not available for mount ${e.mount}`;

  const fields = optionFields(e.mount, e.target);

  if (e.method && !fields.method) return `Method is not supported by ${e.target} target`;
  if (e.method && !["GET", "POST"].includes(e.method)) return "Method must be GET or POST";
  if (e.fullscreen && !fields.fullscreen)
    return "Fullscreen is only supported by HOMEPAGE_WIDGETS widgets";
  if (e.views?.length && !fields.views) return "Views can only be set on SEARCH_ACTION mount";
  if (e.views?.some((v) => !VIEWS.includes(v))) return "Unknown view";
  if (e.aliases?.length && !fields.aliases) return "Aliases can only be set on SEARCH_ACTION mount";

  return null;
};

export const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const defaultIdentifier = (e: ExtensionConfig) =>
  slugify(e.label) || `${e.mount.toLowerCase().replace(/_/g, "-")}-extension`;

/** Explicit value wins; a blank field falls back to the label slug. */
export const identifierOf = (e: ExtensionConfig) => e.identifier?.trim() || defaultIdentifier(e);

/**
 * Identifiers are unique per app - Saleor rejects a manifest that repeats one - so a
 * row that would collide takes the first free `<base>-2`, `<base>-3`, ... instead.
 */
export const uniqueIdentifier = (base: string, taken: Iterable<string>) => {
  const used = new Set(taken);
  let identifier = base;

  for (let suffix = 2; used.has(identifier); suffix++) identifier = `${base}-${suffix}`;

  return identifier;
};

/**
 * Identifiers are filled in the moment a row appears in the configurator, so what
 * installs is what the user sees. Rows already on the list keep theirs; only the
 * added ones move out of the way.
 */
export const appendExtensions = (
  current: ExtensionConfig[],
  added: ExtensionConfig[],
): ExtensionConfig[] => {
  /** Raw entries carry their own identifier (or none) inside the hand-written JSON. */
  const taken = current.filter((e) => !e.raw).map(identifierOf);

  return [
    ...current,
    ...added.map((extension) => {
      if (extension.raw) return extension;

      const identifier = uniqueIdentifier(identifierOf(extension), taken);

      taken.push(identifier);

      return { ...extension, identifier };
    }),
  ];
};

/**
 * Last line of defense: the configurator flags duplicates, but a config can also be
 * hand-edited in the URL, and a duplicate would fail the whole install rather than one
 * extension. Hand-edited raw entries keep whatever the user typed.
 */
export const withUniqueIdentifiers = (extensions: AppExtension[]): AppExtension[] => {
  const used: string[] = [];

  return extensions.map((extension) => {
    if (!extension.identifier) return extension;

    const identifier = uniqueIdentifier(extension.identifier, used);

    used.push(identifier);

    return { ...extension, identifier };
  });
};

/**
 * POST extensions are submitted as a `<form>`, so they need an endpoint that
 * accepts POST; GET ones can point at a plain page.
 */
const extensionUrl = (e: ExtensionConfig, baseUrl: string) => {
  const path = e.method === "POST" ? "/api/placeholder" : "/placeholder";
  const params = new URLSearchParams({ label: e.label, mount: e.mount, target: e.target });
  /** APP_PAGE is rendered inside the Dashboard, so Dashboard requires a relative URL. */
  const origin = e.target === "APP_PAGE" ? "" : baseUrl;

  return `${origin}${path}?${params}`;
};

export const toManifestExtension = (e: ExtensionConfig, baseUrl: string): AppExtension => {
  if (e.raw) return e.raw as unknown as AppExtension;

  const base = {
    label: e.label,
    identifier: identifierOf(e),
    url: extensionUrl(e, baseUrl),
    permissions: [],
  };

  /** Checked first: SEARCH_ACTION is the one mount excluded from the WIDGET target. */
  if (e.mount === "SEARCH_ACTION") {
    /** Aliases are edited as a comma-separated string, so blanks can slip through. */
    const aliases = e.aliases?.map((alias) => alias.trim()).filter(Boolean);

    return {
      ...base,
      mount: "SEARCH_ACTION",
      target: e.target === "WIDGET" ? "POPUP" : e.target,
      options: {
        ...(e.views?.length ? { views: e.views as AppExtensionView[] } : {}),
        ...(aliases?.length ? { aliases } : {}),
      },
    };
  }

  const mount = e.mount as Exclude<Mount, "SEARCH_ACTION">;

  if (e.target === "WIDGET" && mount === "HOMEPAGE_WIDGETS") {
    return {
      ...base,
      mount,
      target: "WIDGET",
      options: { homeWidgetTarget: { method: e.method ?? "GET", fullscreen: !!e.fullscreen } },
    };
  }

  if (e.target === "WIDGET") {
    return {
      ...base,
      mount,
      target: "WIDGET",
      options: { widgetTarget: { method: e.method ?? "GET" } },
    };
  }

  if (e.target === "NEW_TAB") {
    return {
      ...base,
      mount,
      target: "NEW_TAB",
      options: { newTabTarget: { method: e.method ?? "GET" } },
    };
  }

  return e.target === "APP_PAGE"
    ? { ...base, mount, target: "APP_PAGE" }
    : { ...base, mount, target: "POPUP" };
};
