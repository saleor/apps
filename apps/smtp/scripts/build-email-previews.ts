/* eslint-disable no-console */
/**
 * Builds all default email templates to HTML files for local inspection.
 * Run from app root: pnpm test-email-build
 *
 * Output:
 *   email-previews/
 *     *.html        - Preview pages with metadata header + email in iframe
 *     raw/*.html    - Raw email HTML only (exactly what gets sent)
 *     index.html    - Links to all previews
 *
 * Does not use app env or Next.js; only Handlebars + MJML + default templates/payloads.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import Handlebars from "handlebars";
import handlebarsHelpers from "handlebars-helpers";
import mjml2html from "mjml";

import { examplePayloads } from "../src/modules/event-handlers/default-payloads";
import {
  messageEventTypes,
  messageEventTypesLabels,
} from "../src/modules/event-handlers/message-event-types";
import {
  defaultMjmlSubjectTemplates,
  defaultMjmlTemplates,
} from "../src/modules/smtp/default-templates";

handlebarsHelpers({ handlebars: Handlebars });

const OUT_DIR = join(process.cwd(), "email-previews");
const RAW_DIR = join(OUT_DIR, "raw");

// Example branding added to order payloads (simulates runtime enrichment from SMTP config)
const exampleBranding = {
  siteName: "Acme Store",
  // Example logo URL - merchants configure this in SMTP app settings
  logoUrl: null as string | null, // Set to a URL string to test logo display, e.g.: "https://example.com/logo.png"
};

function compileSubject(subjectTemplate: string, payload: unknown): string {
  const fn = Handlebars.compile(subjectTemplate);

  return fn(payload);
}

function compileBody(bodyTemplate: string, payload: unknown): string {
  const fn = Handlebars.compile(bodyTemplate);
  const mjmlResult = fn(payload);
  const result = mjml2html(mjmlResult, { validationLevel: "soft" });

  return result.html;
}

function wrapInPage(title: string, subject: string, emailHtml: string): string {
  const srcdoc = escapeAttr(emailHtml);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; background: #f1f5f9; }
    .meta { background: #fff; padding: 12px 16px; margin-bottom: 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .meta strong { color: #475569; }
    .email { background: #fff; padding: 0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; max-width: 640px; }
    .email iframe { display: block; border: none; width: 100%; min-height: 600px; }
  </style>
</head>
<body>
  <div class="meta">
    <p><strong>Event:</strong> ${escapeHtml(title)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
  </div>
  <div class="email">
    <iframe title="Email body" srcdoc="${srcdoc}"></iframe>
  </div>
</body>
</html>`;
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(RAW_DIR, { recursive: true });

  const links: { slug: string; label: string }[] = [];

  // Order events that receive shop info at runtime
  const orderEvents = new Set([
    "ORDER_CREATED",
    "ORDER_CONFIRMED",
    "ORDER_CANCELLED",
    "ORDER_FULFILLED",
    "ORDER_FULLY_PAID",
    "ORDER_REFUNDED",
    "INVOICE_SENT",
  ]);

  for (const eventType of messageEventTypes) {
    const subjectTemplate = defaultMjmlSubjectTemplates[eventType];
    const bodyTemplate = defaultMjmlTemplates[eventType];
    let payload = examplePayloads[eventType];

    // Enrich order payloads with branding (simulates runtime behavior from SMTP config)
    if (orderEvents.has(eventType)) {
      payload = { ...payload, branding: exampleBranding };
    }

    const subject = compileSubject(subjectTemplate, payload);
    const htmlBody = compileBody(bodyTemplate, payload);

    const label = messageEventTypesLabels[eventType];
    const slug = eventType.toLowerCase().replace(/_/g, "-");
    const fullPage = wrapInPage(label, subject, htmlBody);

    // Write preview page (with wrapper)
    const previewPath = join(OUT_DIR, `${slug}.html`);

    await writeFile(previewPath, fullPage, "utf-8");
    console.log("Wrote %s", previewPath);

    // Write raw email HTML (exactly what gets sent)
    const rawPath = join(RAW_DIR, `${slug}.html`);

    await writeFile(rawPath, htmlBody, "utf-8");
    console.log("Wrote %s", rawPath);

    links.push({ slug, label });
  }

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Email previews</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #f1f5f9; }
    h1 { color: #0f172a; }
    p { color: #475569; margin-bottom: 24px; }
    .note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 24px; border-radius: 4px; }
    .note strong { color: #92400e; }
    table { border-collapse: collapse; width: 100%; max-width: 700px; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    th { color: #64748b; font-weight: 500; font-size: 14px; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .raw { font-size: 13px; color: #64748b; }
  </style>
</head>
<body>
  <h1>Email Previews</h1>
  <p>Default templates built with example payloads.</p>
  <div class="note">
    <strong>Raw email HTML:</strong> Files in <code>raw/</code> contain exactly what gets sent to recipients (no wrapper).
  </div>
  <table>
    <thead>
      <tr>
        <th>Event</th>
        <th>Preview</th>
        <th>Raw HTML</th>
      </tr>
    </thead>
    <tbody>
${links
  .map(
    ({ slug, label }) => `      <tr>
        <td>${escapeHtml(label)}</td>
        <td><a href="${slug}.html">Preview</a></td>
        <td><a href="raw/${slug}.html" class="raw">raw/${slug}.html</a></td>
      </tr>`,
  )
  .join("\n")}
    </tbody>
  </table>
</body>
</html>`;

  await writeFile(join(OUT_DIR, "index.html"), indexHtml, "utf-8");
  console.log("Wrote %s", join(OUT_DIR, "index.html"));
  console.log("\nOpen file://%s/index.html in a browser to inspect.", OUT_DIR);
  console.log("Raw email HTML (no wrapper) in: %s/", RAW_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
