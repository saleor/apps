export const ProvidersTypes = {
  Mailchimp: "Mailchimp",
} as const;

export type ProviderType = keyof typeof ProvidersTypes;

export const isValidProviderType = (value: string | undefined): value is ProviderType => {
  return Object.values(ProvidersTypes).includes(value as ProviderType);
};
