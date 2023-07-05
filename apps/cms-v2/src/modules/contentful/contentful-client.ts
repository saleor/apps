import { createClient, ClientAPI } from "contentful-management";

/**
 * Wrapper facade of
 * https://www.npmjs.com/package/contentful
 */
export class ContentfulClient {
  private client: ClientAPI;
  private space: string;

  constructor(opts: { space: string; accessToken: string }) {
    this.space = opts.space;

    this.client = createClient({
      accessToken: opts.accessToken,
    });
  }

  // todo error handling
  async getContentTypes(env: string) {
    return (await (await this.client.getSpace(this.space)).getEnvironment(env)).getContentTypes();
  }

  // todo connect to form, add field
  async getEnvironments() {
    return (await this.client.getSpace(this.space)).getEnvironments();
  }

  uploadProduct() {
    // todo
  }
}
