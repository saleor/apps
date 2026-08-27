import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { type AppManifest } from "@saleor/app-sdk/types";

import { decodeConfig } from "@/extensions/codec";
import { slugify, toManifestExtension, validate, withUniqueIdentifiers } from "@/extensions/domain";
import { DEFAULT_EXTENSIONS } from "@/extensions/presets";
import { env } from "@/lib/env";
import packageJson from "@/package.json";

/**
 * The manifest is fully driven by the `c` query param - a base64url JSON config
 * produced by the configurator on `/`. Without it, a default preset is served.
 *
 * The app is frontend only: no `tokenTargetUrl`, so Saleor installs it without
 * exchanging an auth token.
 */
export default createManifestHandler({
  manifestFactory({ appBaseUrl, request }) {
    /**
     * Allow to overwrite default app base url, to enable Docker support.
     *
     * See docs: https://docs.saleor.io/docs/3.x/developer/extending/apps/local-app-development
     *
     * `||`, not `??` - the env vars are declared-but-empty in .env, which must fall back too.
     */
    const iframeBaseUrl = env.APP_IFRAME_BASE_URL || appBaseUrl;
    const apiBaseURL = env.APP_API_BASE_URL || appBaseUrl;

    const config = decodeConfig(
      typeof request.query.c === "string" ? request.query.c : undefined,
    ) ?? { extensions: DEFAULT_EXTENSIONS };

    const suffix = config.name?.trim() ? ` - ${config.name.trim()}` : "";

    const manifest: AppManifest = {
      id: `saleor.app.extensions-explorer${suffix ? `.${slugify(config.name!)}` : ""}`,
      version: packageJson.version,
      name: `Extensions Explorer${suffix}`,
      about: "Playground for Saleor Dashboard extensions. Renders placeholders in every mount.",
      appUrl: iframeBaseUrl,
      /**
       * Extensions themselves request no permissions, but the app needs some so
       * the Dashboard has something to put in the extension access token.
       */
      permissions: ["MANAGE_ORDERS", "MANAGE_PRODUCTS", "MANAGE_USERS"],
      extensions: withUniqueIdentifiers(
        config.extensions
          .filter((extension) => validate(extension) === null)
          .map((extension) => toManifestExtension(extension, apiBaseURL)),
      ),
      author: "Saleor Commerce",
      homepageUrl: "https://github.com/saleor/apps",
      supportUrl: "https://saleor.io/discord",
      brand: {
        logo: {
          default: `${apiBaseURL}/logo.png`,
        },
      },
    };

    return manifest;
  },
});
