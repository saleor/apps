/**
 * Where a checklist CTA sends the merchant.
 *
 * - `dashboard`: relative Dashboard path, via `actions.Redirect`
 * - `app`: another installed app resolved by the Dashboard from its manifest
 *   identifier, via `actions.RedirectToApp`
 */
export type AppRedirectTarget =
  | { kind: "dashboard"; to: string }
  | {
      kind: "app";
      appIdentifier: string;
      path?: string;
      /**
       * Dashboard path to use when `RedirectToApp` is not handled — Dashboards
       * older than the action leave the CTA dead otherwise.
       */
      fallbackTo: string;
    };

export type CtaTarget = AppRedirectTarget | { kind: "external"; href: string };

/** Dashboard page listing installed apps — reachable on every supported Dashboard. */
export const INSTALLED_APPS_PATH = "/extensions/installed";
