/**
 * Extensions in this app are deliberately dumb: a dashed box with centered text,
 * plus whatever context Saleor passed in. Shared by the page (GET) and the API
 * route (POST), which is why the CSS lives in a string.
 */
export const PLACEHOLDER_CSS = `
.ph {
  box-sizing: border-box;
  border: 2px dashed currentColor;
  border-radius: 8px;
  padding: 24px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
.ph-label { font-size: 18px; font-weight: 600; }
.ph-meta {
  font-size: 12px;
  opacity: 0.6;
  font-family: ui-monospace, monospace;
  word-break: break-all;
  max-width: 100%;
}
`;

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string,
  );

/** Standalone document - the POST target is opened outside of the app's React tree. */
export const placeholderDocument = ({ label, meta }: { label: string; meta: string[] }) => `
<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(label)}</title>
<style>:root { color-scheme: light dark; } body { margin: 16px; }${PLACEHOLDER_CSS}</style>
</head><body><div class="ph">
<div class="ph-label">${escapeHtml(label)}</div>
${meta.map((line) => `<div class="ph-meta">${escapeHtml(line)}</div>`).join("\n")}
</div></body></html>`;
