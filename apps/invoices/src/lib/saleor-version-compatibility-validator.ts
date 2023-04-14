const semver = require("semver");
export const REQUIRED_SALEOR_VERSION = ">=3.10 <4";

/**
 * TODO Extract to shared or even SDK
 */
export class SaleorVersionCompatibilityValidator {
  constructor(private appRequiredVersion: string = REQUIRED_SALEOR_VERSION) {}

  validateOrThrow(saleorVersion: string) {
    const versionIsValid = semver.satisfies(semver.coerce(saleorVersion), this.appRequiredVersion);

    if (!versionIsValid) {
      throw new Error(`App requires Saleor matching semver: ${this.appRequiredVersion}`);
    }
  }
}
