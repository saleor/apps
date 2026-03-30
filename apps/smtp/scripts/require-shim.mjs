/**
 * Polyfills `require` into ESM scope.
 * Next.js provides this via its bundler, but standalone tsx does not.
 * Usage: node --import ./scripts/require-shim.mjs ...
 */
import { createRequire } from "node:module";

globalThis.require = createRequire(import.meta.url);
