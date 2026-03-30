import type Handlebars from "handlebars";

import { ALLOWED_HELPERS } from "./allowed-helpers";

/**
 * Registers only the explicitly allowed helpers from `handlebars-helpers`
 * onto the given Handlebars instance.
 *
 * Each group listed in ALLOWED_HELPERS is loaded via `require()`,
 * and only the helpers named in that group's array are registered.
 * Groups not listed are never loaded.
 *
 * To change what's available, edit `allowed-helpers.ts`.
 */
export function registerAllowedHelpers(handlebars: typeof Handlebars): void {
  for (const [group, helperNames] of Object.entries(ALLOWED_HELPERS)) {
    // We need require for backwards-compatibility: it must be imported synchronously
    // same as previous hanlebars-helpers usage
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const groupHelpers = require(`handlebars-helpers/lib/${group}`) as Record<
      string,
      Handlebars.HelperDelegate
    >;

    for (const name of helperNames) {
      const helper = groupHelpers[name];

      if (typeof helper === "function") {
        handlebars.registerHelper(name, helper);
      }
    }
  }
}
