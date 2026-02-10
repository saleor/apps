export class FallbackSenderEmail {
  constructor(
    private saleorApiUrl: string,
    private domain: string,
  ) {}

  getEmail() {
    try {
      const url = new URL(this.saleorApiUrl);
      const subdomain = url.hostname.split(".")[0];

      return `${subdomain}@${this.domain}`;
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
