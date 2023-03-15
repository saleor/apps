import { ping } from "@mailchimp/mailchimp_marketing";

export class MailchimpClientOAuth {
  client = require("@mailchimp/mailchimp_marketing");

  constructor(server: string, accessToken: string) {
    this.client.setConfig({
      accessToken,
      server,
    });
  }

  async ping(): Promise<ping.APIHealthStatus> {
    return this.client.ping.get();
  }
}
