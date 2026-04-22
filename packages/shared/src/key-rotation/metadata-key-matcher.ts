/**
 * SDK's EncryptedMetadataManager stores private metadata under a domain-specific
 * key: `${logicalKey}__${saleorApiUrl}` (see `constructDomainSpecificKey` in
 * `@saleor/app-sdk/settings-manager`). When `domain` is falsy the raw logical
 * key is used instead. This helper recognizes both forms so rotation scripts
 * can filter raw GraphQL private metadata entries by logical name.
 */
const DOMAIN_SEPARATOR = "__";

export function isEncryptedMetadataKey(metadataKey: string, logicalName: string): boolean {
  if (metadataKey === logicalName) {
    return true;
  }

  const [prefix] = metadataKey.split(DOMAIN_SEPARATOR);

  return prefix === logicalName;
}

export function matchesAnyEncryptedMetadataKey(
  metadataKey: string,
  logicalNames: readonly string[],
): boolean {
  return logicalNames.some((name) => isEncryptedMetadataKey(metadataKey, name));
}
