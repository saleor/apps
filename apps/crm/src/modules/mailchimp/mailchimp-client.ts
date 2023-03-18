import mailchimp_marketing from "@mailchimp/mailchimp_marketing";

export class MailchimpClientOAuth {
  client = mailchimp_marketing;

  constructor(server: string, accessToken: string) {
    this.client.setConfig({
      accessToken,
      server,
    });
  }

  async ping() {
    return this.client.ping.get();
  }

  async fetchLists() {
    return this.client.lists.getAllLists();
  }

  async addContact(listID: string, email: string) {
    return this.client.lists.addListMember(listID, {
      // TODO - add mapping on frontend?
      status: "pending",
      email_address: email,
      // todo - add address
    });
  }
}
