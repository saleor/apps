export const ENCRYPTED_METADATA_KEYS = {
  CHANNEL_CONFIGURATION: "channel-configuration",
  TAX_PROVIDERS: "tax-providers-v2",
  AVATAX_TAX_CODE_MAP: "avatax-tax-code-map",
} as const;

export const ALL_ENCRYPTED_METADATA_KEYS = Object.values(ENCRYPTED_METADATA_KEYS);
