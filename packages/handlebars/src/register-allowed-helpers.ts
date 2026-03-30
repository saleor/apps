import type Handlebars from "handlebars";

import { ALLOWED_HELPERS, type HelperGroup } from "./allowed-helpers";

/**
 * Registers only the explicitly allowed helpers from `handlebars-helpers`
 * onto the given Handlebars instance.
 *
 * Instead of loading all helpers via `handlebarsHelpers({ handlebars })`,
 * this function cherry-picks individual helpers from each group module,
 * so we have full control over what's available in user-authored templates.
 *
 * To remove a helper, delete its entry from `ALLOWED_HELPERS` in `allowed-helpers.ts`.
 */
export function registerAllowedHelpers(handlebars: typeof Handlebars): void {
  const groupCache = new Map<HelperGroup, Record<string, Handlebars.HelperDelegate>>();

  const getGroup = (group: HelperGroup): Record<string, Handlebars.HelperDelegate> => {
    const cached = groupCache.get(group);

    if (cached) {
      return cached;
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const helpers = require(`handlebars-helpers/lib/${group}`) as Record<
      string,
      Handlebars.HelperDelegate
    >;

    groupCache.set(group, helpers);

    return helpers;
  };

  for (const [helperName, group] of Object.entries(ALLOWED_HELPERS)) {
    const groupHelpers = getGroup(group);
    const helper = groupHelpers[helperName];

    if (typeof helper === "function") {
      handlebars.registerHelper(helperName, helper);
    }
  }
}
