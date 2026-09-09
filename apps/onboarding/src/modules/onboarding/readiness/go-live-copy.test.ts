import { describe, expect, it } from "vitest";

import { CUSTOMER_EMAILS_APP_IDENTIFIER } from "./app-identifiers";
import {
  CUSTOMER_EMAILS_MANIFEST_URL,
  getGoLiveRows,
  GO_LIVE_ROWS,
  PAPER_DEMO_URL,
  PAPER_PRODUCTION_CHECKLIST_URL,
  PAPER_ROWS,
  PAPER_VERCEL_DEPLOY_URL,
  resolveCustomerEmailsAppCta,
} from "./go-live-copy";
import { INSTALLED_APPS_PATH } from "./redirect-target";

describe("go-live-copy", () => {
  it("keeps go-live and Paper as guidance-only rows with CTAs", () => {
    expect(GO_LIVE_ROWS).toHaveLength(2);
    expect(PAPER_ROWS).toHaveLength(3);
    expect(GO_LIVE_ROWS.every((row) => row.cta && row.ctaLabel)).toBe(true);
    expect(
      PAPER_ROWS.filter((row) => row.id === "paper-deploy").every((row) => row.cta && row.ctaLabel),
    ).toBe(true);
    expect(PAPER_ROWS.find((row) => row.id === "paper-cms")?.cta).toBeUndefined();
    expect(PAPER_ROWS.find((row) => row.id === "paper-cache")?.cta).toBeUndefined();
    expect(PAPER_ROWS.some((row) => row.id === "paper-api")).toBe(false);
  });

  it("opens the installed Customer Emails app via RedirectToApp when present", () => {
    const rows = getGoLiveRows(true);
    const email = rows.find((row) => row.id === "customer-email");

    const expected = {
      kind: "app",
      appIdentifier: CUSTOMER_EMAILS_APP_IDENTIFIER,
      fallbackTo: INSTALLED_APPS_PATH,
      permission: "MANAGE_APPS",
    };

    expect(email?.cta).toStrictEqual(expected);
    expect(email?.ctaLabel).toBe("Open Customer Emails");
    expect(resolveCustomerEmailsAppCta(true)).toStrictEqual(expected);
  });

  it("falls back to Customer Emails install when the app is missing", () => {
    const rows = getGoLiveRows(false);
    const email = rows.find((row) => row.id === "customer-email");
    const templates = rows.find((row) => row.id === "email-templates");

    expect(email?.cta).toStrictEqual({
      kind: "dashboard",
      to: `/extensions/app/install?manifestUrl=${encodeURIComponent(CUSTOMER_EMAILS_MANIFEST_URL)}`,
      permission: "MANAGE_APPS",
    });
    expect(email?.ctaLabel).toBe("Set up Customer Emails");
    expect(templates?.ctaLabel).toBe("Set up Customer Emails");
  });

  it("points Paper deploy at Vercel and keeps a production checklist URL", () => {
    expect(PAPER_ROWS[0]?.cta).toStrictEqual({ kind: "external", href: PAPER_VERCEL_DEPLOY_URL });
    expect(PAPER_PRODUCTION_CHECKLIST_URL).toMatch(/production-checklist/);
    expect(PAPER_DEMO_URL).toBe("https://demo.saleor.io");
  });
});
