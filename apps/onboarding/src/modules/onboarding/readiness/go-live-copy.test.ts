import { describe, expect, it } from "vitest";

import {
  getGoLiveRows,
  GO_LIVE_ROWS,
  PAPER_DEMO_URL,
  PAPER_PRODUCTION_CHECKLIST_URL,
  PAPER_ROWS,
  PAPER_VERCEL_DEPLOY_URL,
  resolveSmtpAppHref,
  SMTP_DOCS_URL,
  SMTP_MANIFEST_URL,
} from "./go-live-copy";

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

  it("opens the installed SMTP app when present", () => {
    const appId = "QXBwOjQy";
    const rows = getGoLiveRows(appId);
    const email = rows.find((row) => row.id === "customer-email");

    expect(email?.cta).toStrictEqual({
      kind: "dashboard",
      href: `/extensions/app/${encodeURIComponent(appId)}`,
      permission: "MANAGE_APPS",
    });
    expect(resolveSmtpAppHref(appId)).toBe(`/extensions/app/${encodeURIComponent(appId)}`);
  });

  it("falls back to SMTP install when the app is missing", () => {
    const email = getGoLiveRows(null).find((row) => row.id === "customer-email");

    expect(email?.cta).toStrictEqual({
      kind: "dashboard",
      href: `/extensions/app/install?manifestUrl=${encodeURIComponent(SMTP_MANIFEST_URL)}`,
      permission: "MANAGE_APPS",
    });
    expect(SMTP_DOCS_URL).toMatch(/smtp/i);
  });

  it("points Paper deploy at Vercel and keeps a production checklist URL", () => {
    expect(PAPER_ROWS[0]?.cta).toStrictEqual({ kind: "external", href: PAPER_VERCEL_DEPLOY_URL });
    expect(PAPER_PRODUCTION_CHECKLIST_URL).toMatch(/production-checklist/);
    expect(PAPER_DEMO_URL).toBe("https://demo.saleor.io");
  });
});
