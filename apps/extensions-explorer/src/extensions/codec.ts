import { type ExtensionConfig } from "./domain";

export type PlaygroundConfig = {
  /** Appended to app name and id, so several configurations can coexist in one Saleor. */
  name?: string;
  extensions: ExtensionConfig[];
};

/**
 * Config travels in the manifest URL (`/api/manifest?c=...`), so it must survive
 * copy-pasting: base64url, no padding, UTF-8 safe.
 */
const toBase64Url = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let binary = "";

  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (encoded: string) => {
  const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));

  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
};

export const encodeConfig = (config: PlaygroundConfig) => toBase64Url(JSON.stringify(config));

/** Returns null for anything that isn't a decodable config - callers fall back to a default. */
export const decodeConfig = (encoded: string | undefined): PlaygroundConfig | null => {
  if (!encoded) return null;

  try {
    const parsed = JSON.parse(fromBase64Url(encoded));

    return Array.isArray(parsed?.extensions) ? (parsed as PlaygroundConfig) : null;
  } catch {
    return null;
  }
};
