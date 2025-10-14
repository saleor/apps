import { SaleorSchemaVersion } from "@saleor/app-sdk/types";
import semver from "semver";

export class SaleorVersionCompatibilityValidator {
  private appRequiredVersion: string;

  constructor(appRequiredVersion: string) {
    this.appRequiredVersion = appRequiredVersion;
  }

  isSaleorCompatible(saleorSchemaVersion: SaleorSchemaVersion) {
    const [major, minor] = saleorSchemaVersion;

    return semver.satisfies(`${major}.${minor}.0`, this.appRequiredVersion, {
      includePrerelease: true,
    });
  }
}
