export class TenantName {
  private MAX_LENGTH = 64;

  constructor(private saleorApiUrl: string) {}

  getTenantName() {
    const url = new URL(this.saleorApiUrl);

    const domain = url.hostname;

    const noDots = domain.replaceAll(".", "_");

    const trimmed = noDots.substring(0, this.MAX_LENGTH);

    return trimmed;
  }
}
