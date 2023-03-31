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

  async addContact(
    listID: string,
    email: string,
    meta: {
      firstName?: string;
      lastName?: string;
      extraTags?: string[];
    }
  ) {
    return this.client.lists.addListMember(listID, {
      // TODO - add mapping on frontend?
      status: "transactional",
      email_address: email,
      tags: ["Saleor Import", ...(meta.extraTags ?? [])],
      merge_fields: {
        FNAME: meta.firstName,
        LNAME: meta.lastName,
      },
      // todo - add address
    });
  }

  // TODO - map address
  async batchAddContacts(
    listID: string,
    contacts: Array<{ email: string; lastName?: string; firstName?: string; tags?: string[] }>
  ) {
    /**
     * method "batchListMembers" exist in Mailchimp SDK
     * https://mailchimp.com/developer/marketing/api/list-members/
     *
     * Its not available in typings, hence ts-ignore
     */
    // @ts-ignore
    return this.client.lists.batchListMembers(listID, {
      members: contacts.map((c) => ({
        status: "transactional",
        email_address: c.email,
        merge_fields: {
          FNAME: c.firstName,
          LNAME: c.lastName,
        },
        tags: ["Saleor Import", ...(c.tags ?? [])],
      })),
    });
  }
}
