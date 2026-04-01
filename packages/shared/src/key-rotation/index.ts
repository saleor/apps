/**
 * Key rotation utilities for SECRET_KEY rotation across Saleor apps.
 *
 * Two encryption backends exist in apps and are cryptographically INCOMPATIBLE:
 *
 * 1. SDK encrypt/decrypt (`@saleor/app-sdk/settings-manager`)
 *    - Used by: EncryptedMetadataManager (Klaviyo, SMTP, Products Feed, AvaTax, Segment)
 *    - Format: aes-256-cbc, 16-char IV prepended without separator, key via prepareKey()
 *    - Wrapper: `createRotatingDecryptCallback`
 *
 * 2. Custom Encryptor (`packages/shared/src/encryptor.ts`)
 *    - Used by: DynamoDB repos (Stripe, NP Atobarai)
 *    - Format: aes-256-cbc, hex-encoded 16-byte IV separated by ":"
 *    - Wrapper: `RotatingEncryptor`
 *
 * Both wrappers delegate logic to `tryDecryptWithFallback`.
 * Which tries to decrypt using fallback keys if primary fails, and logs a warning when fallback is used.
 */

export { createRotatingDecryptCallback } from "./rotating-decrypt-callback";
export { RotatingEncryptor } from "./rotating-encryptor";
