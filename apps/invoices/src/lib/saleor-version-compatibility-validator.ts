const semver = require("semver");

/**
 * TODO Extract to shared or even SDK
 */
export class SaleorVersionCompatibilityValidator {
  constructor(private appRequiredVersion: string) {}

  validateOrThrow(saleorVersion: string) {
    const versionIsValid = semver.satisfies(saleorVersion, this.appRequiredVersion, {
      includePrerelease: true,
    });

    if (!versionIsValid) {
      throw new Error(`App requires Saleor matching semver: ${this.appRequiredVersion}`);
    }
  }
}
