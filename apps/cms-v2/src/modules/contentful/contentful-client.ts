import { createClient, ContentfulClientApi } from "contentful";

export class ContentfulClient {
  private client: ContentfulClientApi<undefined>;

  constructor(opts: { space: string; accessToken: string }) {
    this.client = createClient({
      accessToken: opts.accessToken,
      space: opts.space,
    });
  }

  // todo - fetch fields and propose them to the user
  getContentType(type: string) {
    return this.client.getContentType(type);
  }

  // todo list types on frontend
  getContentTypes() {
    return this.client.getContentTypes();
  }

  ping() {
    return this.getContentTypes(); // todo maybe there is cheaper method for that
  }
}
