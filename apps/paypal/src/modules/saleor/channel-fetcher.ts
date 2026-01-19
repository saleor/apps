import { err, ok, Result } from "neverthrow";
import { Client } from "urql";

export class ChannelsFetcher {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async fetchChannels(): Promise<Result<Array<{ id: string; name: string; slug: string }>, Error>> {
    try {
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
      
      if (result.error) {
        return err(new Error(`GraphQL error: ${result.error.message}`));
      }

      return ok(result.data?.channels || []);
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
