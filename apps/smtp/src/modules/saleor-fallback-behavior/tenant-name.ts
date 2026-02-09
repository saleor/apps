export class TenantName {
  private MAX_LENGTH = 64;

  constructor(private saleorApiUrl: string) {}

  getTenantName() {
    try {
      const url = new URL(this.saleorApiUrl);

      const domain = url.hostname;

      const noDots = domain.replaceAll(".", "_");

      const trimmed = noDots.substring(0, this.MAX_LENGTH);

      return trimmed;
    } catch (e) {
      throw new Error(
        `Failed to parse Saleor API URL, usually that means Saleor request did not include it, or there is application error. Received: "${this.saleorApiUrl}"`,
        {
          cause: e,
        },
      );
    }
  }
}
