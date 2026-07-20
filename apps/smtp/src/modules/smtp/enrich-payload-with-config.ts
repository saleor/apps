import { type SmtpConfiguration } from "./configuration/smtp-config-schema";

type EnrichConfig = Partial<
  Pick<SmtpConfiguration, "brandingSiteName" | "brandingLogoUrl" | "customVariables">
>;

/**
 * Enriches the template payload with data derived from the SMTP configuration:
 * - `branding` (from brandingSiteName / brandingLogoUrl) so templates can use {{branding.siteName}} / {{branding.logoUrl}}
 * - `customVariables` (user-defined key-value pairs) so templates can use {{customVariables.myKey}}
 *
 * These keys are always replaced (not deep-merged) so the configuration is the source of truth.
 * Used both when sending real emails and when rendering the live preview, so what the user
 * sees in the editor matches what will be sent.
 */
export const enrichPayloadWithConfig = (payload: unknown, config: EnrichConfig): unknown => {
  const base =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};

  const enriched: Record<string, unknown> = { ...base };

  const hasBranding = config.brandingSiteName || config.brandingLogoUrl;

  if (hasBranding) {
    enriched.branding = {
      siteName: config.brandingSiteName || null,
      logoUrl: config.brandingLogoUrl || null,
    };
  }

  const customVariables = config.customVariables ?? {};

  if (Object.keys(customVariables).length > 0) {
    enriched.customVariables = customVariables;
  }

  return enriched;
};
