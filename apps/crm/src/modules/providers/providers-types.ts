export const ProvidersTypes = {
  Mailchimp: "Mailchimp",
} as const;

export type ProviderType = keyof typeof ProvidersTypes;
