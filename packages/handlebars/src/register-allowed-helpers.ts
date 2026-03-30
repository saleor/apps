import type Handlebars from "handlebars";
import type handlebarsHelpersType from "handlebars-helpers";

import { ALLOWED_HELPERS } from "./allowed-helpers";

/**
 * Registers only the explicitly allowed helpers from `handlebars-helpers`
 * onto the given Handlebars instance.
 *
 * The caller must pass the `handlebars-helpers` default export because
 * this package cannot import it directly — webpack follows imports from
 * workspace packages and fails on `handlebars-helpers` internal dynamic requires.
 *
 * Usage:
 *   import handlebarsHelpers from "handlebars-helpers";
 *   registerAllowedHelpers(Handlebars, handlebarsHelpers);
 *
 * To change what's available, edit `allowed-helpers.ts`.
 */
export function registerAllowedHelpers(
  handlebars: typeof Handlebars,
  handlebarsHelpers: typeof handlebarsHelpersType,
): void {
  const allowedGroupNames = Object.keys(ALLOWED_HELPERS);
  const allowedHelperNames = new Set(Object.values(ALLOWED_HELPERS).flat());

  // Save built-in helpers so we don't strip them
  const builtInHelpers = new Set(Object.keys(handlebars.helpers));

  handlebarsHelpers(allowedGroupNames, { handlebars });

  for (const name of Object.keys(handlebars.helpers)) {
    if (!allowedHelperNames.has(name) && !builtInHelpers.has(name)) {
      handlebars.unregisterHelper(name);
    }
  }
}
