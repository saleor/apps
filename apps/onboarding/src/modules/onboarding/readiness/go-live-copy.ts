import { CUSTOMER_EMAILS_APP_IDENTIFIER } from "./app-identifiers";
import { type CtaTarget, INSTALLED_APPS_PATH } from "./redirect-target";

/**
 * Secondary go-live guidance (Customer Emails, email templates, Paper storefront).
 * These rows never count toward required Store Readiness progress.
 */

export type GuidanceCtaTarget = CtaTarget & { permission?: string };

export type GuidanceRow = {
  id: string;
  title: string;
  description: string;
  details: string;
  ctaLabel?: string;
  cta?: GuidanceCtaTarget;
};

/** Hosted Customer Emails app manifest (Saleor Cloud / App Store install). */
export const CUSTOMER_EMAILS_MANIFEST_URL = "https://customer-emails.saleor.app/api/manifest";

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

const CUSTOMER_EMAILS_INSTALL_PATH = `/extensions/app/install?manifestUrl=${encodeURIComponent(
  CUSTOMER_EMAILS_MANIFEST_URL,
)}`;

/**
 * Open the installed Customer Emails app via Dashboard (`RedirectToApp`), or the install flow when it isn’t present.
 */
export const resolveCustomerEmailsAppCta = (hasCustomerEmailsApp: boolean): GuidanceCtaTarget =>
  hasCustomerEmailsApp
    ? {
        kind: "app",
        appIdentifier: CUSTOMER_EMAILS_APP_IDENTIFIER,
        fallbackTo: INSTALLED_APPS_PATH,
        permission: "MANAGE_APPS",
      }
    : { kind: "dashboard", to: CUSTOMER_EMAILS_INSTALL_PATH, permission: "MANAGE_APPS" };

/** Go-live rows with Customer Emails CTAs resolved against the live install (if any). */
export const getGoLiveRows = (hasCustomerEmailsApp: boolean): GuidanceRow[] => {
  const cta = resolveCustomerEmailsAppCta(hasCustomerEmailsApp);
  const ctaLabel = hasCustomerEmailsApp ? "Open Customer Emails" : "Set up Customer Emails";

  return [
    {
      id: "customer-email",
      title: "Connect customer email",
      description:
        "Saleor doesn’t send order emails by itself — install Customer Emails and connect your mail server.",
      details:
        "Customers get order confirmations and account messages through this extension. Open it to add an SMTP connection, or install it if it isn’t present yet.",
      ctaLabel,
      cta,
    },
    {
      id: "email-templates",
      title: "Review email templates",
      description: "Check order and account emails before real customers receive them.",
      details:
        "After Customer Emails is connected, open the app and review notifications (order confirmation, password reset, and related events). Adjust branding and wording so production mail matches your store.",
      ctaLabel,
      cta,
    },
  ];
};

/** Fallback rows when it isn’t known yet whether Customer Emails is installed (install CTA). */
export const GO_LIVE_ROWS: GuidanceRow[] = getGoLiveRows(false);

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
