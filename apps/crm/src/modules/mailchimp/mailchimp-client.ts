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
      status: "transactional",
      email_address: email,
      tags: ["Saleor Import"],
      // todo - add address
    });
  }

  async batchAddContacts(listID: string, emails: string[]) {
    /**
     * method "batchListMembers" exist in Mailchimp SDK
     * https://mailchimp.com/developer/marketing/api/list-members/
     *
     * Its not available in typings, hence ts-ignore
     */
    // @ts-ignore
    return this.client.lists.batchListMembers(listID, {
      members: emails.map((e) => ({
        status: "transactional",
        email_address: e,
        tags: ["Saleor Import"],
      })),
    });
  }
}
