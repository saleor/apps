import { SaleorSchemaVersion } from "@saleor/app-sdk/types";
import semver from "semver";

export class SaleorVersionCompatibilityValidator {
  private appRequiredVersion: string;

  constructor(appRequiredVersion: string) {
    this.appRequiredVersion = appRequiredVersion;
  }

  isValid(saleorVersion: string) {
    return semver.satisfies(saleorVersion, this.appRequiredVersion, {
      includePrerelease: true,
    });
  }

  validateOrThrow(saleorVersion: string) {
    if (!this.isValid(saleorVersion)) {
      throw new Error(
        `Your Saleor version (${saleorVersion}) doesn't match App's required version (semver: ${this.appRequiredVersion})`,
      );
    }
  }

  isSaleorCompatible(saleorSchemaVersion: SaleorSchemaVersion) {
    const [major, minor] = saleorSchemaVersion;

    return semver.satisfies(`${major}.${minor}.0`, this.appRequiredVersion, {
      includePrerelease: true,
    });
  }
}
