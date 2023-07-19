import { describe, expect, it, vi } from "vitest";
import { createMocks } from "node-mocks-http";

import { customerCreatedHandler } from "../../pages/api/webhooks/customer-created";
import { AuthData } from "@saleor/app-sdk/APL";

import mailchimp_marketing from "@mailchimp/mailchimp_marketing";
import {
  IMailchimpConfigSettingsManagerV1,
  MailchimpConfigType,
} from "../../modules/mailchimp/mailchimp-config-settings-manager";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Mock settings manager. Consider mocking graphQL api instead
 */
vi.mock("../../modules/mailchimp/mailchimp-config-settings-manager", () => {
  class MockManager implements IMailchimpConfigSettingsManagerV1 {
    async getConfig(): Promise<MailchimpConfigType> {
      return {
        token: "mailchimpToken",
        customerCreateEvent: {
          enabled: true,
          listId: "saleor",
        },
        dc: "us41",
      };
    }
  }

  return {
    MailchimpConfigSettingsManager: MockManager,
  };
});

/**
 * Spy on mailchimp client
 */
mailchimp_marketing.lists.addListMember = vi.fn();

const mockAuthData: AuthData = {
  saleorApiUrl: "https://demo.saleor.io/graphql/",
  domain: "demo.saleor.io",
  appId: "XYZ",
  token: "token-mocked",
};

describe("CUSTOMER_CREATED webhook", () => {
  it("Call Mailchimp client to add customer with properly mapped data and tags", async () => {
    const { req, res } = createMocks({});

    await customerCreatedHandler(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse,
      {
        authData: mockAuthData,
        payload: {
          user: {
            id: "user-id",
            email: "someuser@gmail.com",
            firstName: "John",
            lastName: "Doe",
            privateMetadata: [
              {
                key: "mailchimp_tags",
                value: JSON.stringify(["tag1"]),
              },
            ],
          },
        },
        event: "CUSTOMER_CREATED",
        baseUrl: "localhost:3000",
      }
    );

    return expect(mailchimp_marketing.lists.addListMember).toHaveBeenCalledWith("saleor", {
      email_address: "someuser@gmail.com",
      merge_fields: {
        FNAME: "John",
        LNAME: "Doe",
      },
      status: "transactional",
      tags: ["Saleor Import", "tag1"],
    });
  });
  it.todo('Doesnt do anything if configuration "customerCreateEvent" is disabled');
});
