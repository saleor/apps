/**
 * Polyfills `require` into ESM scope.
 * Next.js provides this via its bundler, but standalone tsx does not.
 * Usage: node --import ./scripts/require-shim.mjs ...
 *
 * A plain createRequire(import.meta.url) anchors relative resolution to this
 * file's directory. We wrap it so relative paths ("./…", "../…") resolve from
 * the actual caller's location via stack introspection, matching how per-file
 * CJS require behaves.
 */
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const baseRequire = createRequire(import.meta.url);
const thisFile = fileURLToPath(import.meta.url);

function getCallerDir() {
  const orig = Error.prepareStackTrace;

  Error.prepareStackTrace = (_err, sites) => sites;

  const stack = /** @type {NodeJS.CallSite[]} */ (new Error().stack);

  Error.prepareStackTrace = orig;

  for (const site of stack) {
    const file = site.getFileName?.();

    if (file && file !== thisFile) {
      return dirname(file.startsWith("file://") ? fileURLToPath(file) : file);
    }
  }

  return null;
}

globalThis.require = new Proxy(baseRequire, {
  apply(_target, _thisArg, [id, ...rest]) {
    if (typeof id === "string" && (id.startsWith("./") || id.startsWith("../"))) {
      const callerDir = getCallerDir();

      if (callerDir) {
        return baseRequire(resolve(callerDir, id));
      }
    }

    return baseRequire(id, ...rest);
  },
});
