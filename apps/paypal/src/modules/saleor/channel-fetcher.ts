import { Client } from "urql";

export class ChannelsFetcher {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async fetchChannels() {
    const query = `
      query GetChannels {
        channels {
          id
          name
          slug
        }
      }
    `;

    const result = await this.client.query(query, {}).toPromise();
    return result.data?.channels || [];
  }
}
