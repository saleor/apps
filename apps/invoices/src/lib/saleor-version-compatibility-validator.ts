const semver = require("semver");

/**
 * TODO Extract to shared or even SDK
 */
export class SaleorVersionCompatibilityValidator {
  constructor(private appRequiredVersion: string) {}

  validateOrThrow(saleorVersion: string) {
    const versionIsValid = semver.satisfies(semver.coerce(saleorVersion), this.appRequiredVersion);

    if (!versionIsValid) {
      throw new Error(`App requires Saleor matching semver: ${this.appRequiredVersion}`);
    }
  }
}
