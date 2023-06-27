import { DatadogSite } from "../generated/graphql";

export const API_KEYS_LINKS: { [key in DatadogSite]: string } = {
  [DatadogSite.Us1]: "https://app.datadoghq.com/organization-settings/api-keys",
  [DatadogSite.Us3]: "https://us3.datadoghq.com/organization-settings/api-keys",
  [DatadogSite.Us5]: "https://us5.datadoghq.com/organization-settings/api-keys",
  [DatadogSite.Eu1]: "https://app.datadoghq.eu/organization-settings/api-keys",
  [DatadogSite.Us1Fed]: "https://app.ddog-gov.com/organization-settings/api-keys",
};

export const DATADOG_SITES_LINKS: { [key in DatadogSite]: string } = {
  [DatadogSite.Us1]: "https://datadoghq.com",
  [DatadogSite.Us3]: "https://us3.datadoghq.com",
  [DatadogSite.Us5]: "https://us5.datadoghq.com",
  [DatadogSite.Eu1]: "https://datadoghq.eu",
  [DatadogSite.Us1Fed]: "https://ddog-gov.com",
};
