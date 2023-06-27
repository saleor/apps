const semver = require("semver");

export class SaleorVersionCompatibilityValidator {
  constructor(private appRequiredVersion: string) {}

  isValid(saleorVersion: string) {
    return semver.satisfies(saleorVersion, this.appRequiredVersion, {
      includePrerelease: true,
    });
  }

  validateOrThrow(saleorVersion: string) {
    if (!this.isValid(saleorVersion)) {
      throw new Error(
        `Your Saleor version (${saleorVersion}) doesn't match App's required version (semver: ${this.appRequiredVersion})`
      );
    }
  }
}
