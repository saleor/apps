/**
 * Secondary go-live guidance (SMTP, email templates, Paper storefront).
 * These rows never count toward required Store Readiness progress.
 */

export type GuidanceCtaTarget =
  | { kind: "dashboard"; href: string; permission?: string }
  | { kind: "external"; href: string };

export type GuidanceRow = {
  id: string;
  title: string;
  description: string;
  details: string;
  ctaLabel?: string;
  cta?: GuidanceCtaTarget;
};

export const SMTP_DOCS_URL = "https://docs.saleor.io/developer/app-store/apps/smtp/overview";

/** Canonical SMTP app identifier from the app manifest. */
export const SMTP_APP_IDENTIFIER = "saleor.app.smtp";

/** Hosted SMTP app manifest (Saleor Cloud / App Store install). */
export const SMTP_MANIFEST_URL = "https://smtp.saleor.app/api/manifest";

/** Live Paper demo storefront. */
export const PAPER_DEMO_URL = "https://demo.saleor.io";

/** Vercel one-click clone — same env set as the Paper README deploy button. */
export const PAPER_VERCEL_DEPLOY_URL =
  "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsaleor%2Fstorefront&env=NEXT_PUBLIC_SALEOR_API_URL%2CNEXT_PUBLIC_DEFAULT_CHANNEL%2CNEXT_PUBLIC_DEFAULT_LOCALE%2CNEXT_PUBLIC_STOREFRONT_LOCALES&project-name=my-saleor-storefront&repository-name=my-saleor-storefront";

/** Merchant production checklist in the Paper repo (deep-link target). */
export const PAPER_PRODUCTION_CHECKLIST_URL =
  "https://github.com/saleor/storefront/blob/main/docs/production-checklist.md";

export const GO_LIVE_SECTION = {
  title: "Before you go live",
  subtitle: "Customer email for production stores",
} as const;

export const PAPER_SECTION = {
  title: "Connect Paper storefront",
  subtitle: "Saleor is headless — deploy a storefront when you’re ready to sell online",
} as const;

/**
 * Open the installed SMTP app, or the Dashboard install flow when it isn’t present yet.
 */
export const resolveSmtpAppHref = (smtpAppId: string | null): string => {
  if (smtpAppId) {
    return `/extensions/app/${encodeURIComponent(smtpAppId)}`;
  }

  return `/extensions/app/install?manifestUrl=${encodeURIComponent(SMTP_MANIFEST_URL)}`;
};

const smtpDashboardCta = (smtpAppId: string | null): GuidanceCtaTarget => ({
  kind: "dashboard",
  href: resolveSmtpAppHref(smtpAppId),
  permission: "MANAGE_APPS",
});

/** Go-live rows with SMTP CTAs resolved against the live install (if any). */
export const getGoLiveRows = (smtpAppId: string | null): GuidanceRow[] => [
  {
    id: "customer-email",
    title: "Connect customer email",
    description:
      "Saleor doesn’t send order emails by itself — install the SMTP app and point it at your mail server.",
    details:
      "Use the SMTP extension (similar to a Shopify notification app) so customers get order confirmations and account messages. Open the SMTP app to configure your host, or install it if it isn’t present yet.",
    ctaLabel: "Set up SMTP",
    cta: smtpDashboardCta(smtpAppId),
  },
  {
    id: "email-templates",
    title: "Review email templates",
    description: "Check order and account emails before real customers receive them.",
    details:
      "After SMTP is connected, open the app and review MJML templates (order confirmation, password reset, and related events). Adjust branding and wording so production mail matches your store.",
    ctaLabel: "Open SMTP",
    cta: smtpDashboardCta(smtpAppId),
  },
];

/** Fallback rows when the SMTP install id isn’t known yet (install CTA). */
export const GO_LIVE_ROWS: GuidanceRow[] = getGoLiveRows(null);

export const PAPER_ROWS: GuidanceRow[] = [
  {
    id: "paper-deploy",
    title: "Deploy Paper",
    description:
      "Saleor’s fast, production-ready storefront — full i18n and checkout, one-click deploy.",
    details:
      "Paper is a minimal, production-ready Saleor storefront — fast by default, built for international commerce, with checkout you can ship. Customize in code or with AI agents. Deploy in one click with your Saleor API URL and channel, or clone saleor/storefront and work locally.",
    ctaLabel: "Deploy on Vercel",
    cta: { kind: "external", href: PAPER_VERCEL_DEPLOY_URL },
  },
  {
    id: "paper-cache",
    title: "Wire production cache updates",
    description: "Keep the storefront fresh when catalog or content changes.",
    // Cloud Paper app is not public; CTA will point at Explore once it’s listed.
    details:
      "On Saleor Cloud, install the Paper app from Extensions — it registers webhooks and revalidates the storefront when catalog or Models change. Self-hosted: point Saleor webhooks at your storefront’s /api/revalidate.",
  },
  {
    id: "paper-cms",
    title: "Edit storefront copy in Saleor",
    description:
      "Homepage, announcement bar, and checkout copy live in Dashboard → Models — no redeploy.",
    details:
      "Paper reads marketing copy from Saleor Models (homepage sections, announcement bar, cart and checkout). Once those Models exist — Paper app init, or Configurator — edit them in Dashboard → Modeling. Until then, Paper uses built-in defaults.",
  },
];
