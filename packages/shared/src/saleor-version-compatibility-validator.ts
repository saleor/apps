const semver = require("semver");

export class SaleorVersionCompatibilityValidator {
  constructor(private appRequiredVersion: string) {}

  validateOrThrow(saleorVersion: string) {
    const versionIsValid = semver.satisfies(saleorVersion, this.appRequiredVersion, {
      includePrerelease: true,
    });

    if (!versionIsValid) {
      throw new Error(
        `Your Saleor version (${saleorVersion}) doesn't match App's required version (semver: ${this.appRequiredVersion})`
      );
    }
  }
}
