import { type OnboardingState } from "../onboarding-context/types";
import { type StoreReadiness } from "./get-store-readiness";

const STORAGE_KEY = "saleor-app-onboarding:home-snapshot:v1";

export type HomeSnapshot = {
  saleorApiUrl: string | null;
  readiness: StoreReadiness;
  prefs: OnboardingState;
};

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

const isStoreReadiness = (value: unknown): value is StoreReadiness => {
  if (!value || typeof value !== "object") return false;

  const row = value as StoreReadiness;

  return (
    isNullableString(row.channelId) &&
    isNullableString(row.channelName) &&
    isNullableString(row.smtpAppId) &&
    typeof row.hasChannels === "boolean" &&
    typeof row.hasWarehouse === "boolean" &&
    typeof row.hasShipping === "boolean" &&
    typeof row.channelReady === "boolean" &&
    typeof row.hasProduct === "boolean" &&
    typeof row.hasPaymentApp === "boolean" &&
    typeof row.hasOrder === "boolean" &&
    typeof row.channelsKnown === "boolean" &&
    typeof row.shippingKnown === "boolean" &&
    typeof row.productsKnown === "boolean" &&
    typeof row.paymentsKnown === "boolean" &&
    typeof row.ordersKnown === "boolean"
  );
};

const isPrefs = (value: unknown): value is OnboardingState => {
  if (!value || typeof value !== "object") return false;

  const prefs = value as OnboardingState;

  return (
    typeof prefs.onboardingExpanded === "boolean" && typeof prefs.builderExpanded === "boolean"
  );
};

const normalizeApiUrl = (value: string) => value.replace(/\/+$/, "");

/**
 * Dashboard mounts the widget iframe with `?saleorApiUrl=…` before AppBridge hydrates.
 * Use that so the first paint can reject another shop’s snapshot.
 */
export const getIframeSaleorApiUrl = (): string | null => {
  if (typeof window === "undefined") return null;

  return new URLSearchParams(window.location.search).get("saleorApiUrl");
};

export const readHomeSnapshot = (saleorApiUrl?: string | null): HomeSnapshot | null => {
  if (typeof sessionStorage === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<HomeSnapshot>;

    if (!isStoreReadiness(parsed.readiness) || !isPrefs(parsed.prefs)) {
      return null;
    }

    const snapshotUrl = parsed.saleorApiUrl ?? null;

    if (
      saleorApiUrl &&
      snapshotUrl &&
      normalizeApiUrl(snapshotUrl) !== normalizeApiUrl(saleorApiUrl)
    ) {
      return null;
    }

    // Unkeyed leftovers are unsafe once we know which shop this iframe is for.
    if (saleorApiUrl && !snapshotUrl) {
      return null;
    }

    return {
      saleorApiUrl: snapshotUrl,
      readiness: parsed.readiness,
      prefs: parsed.prefs,
    };
  } catch {
    return null;
  }
};

export const writeHomeSnapshot = (snapshot: HomeSnapshot): void => {
  if (typeof sessionStorage === "undefined") return;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // quota / private mode — skip; next visit shows the skeleton
  }
};
