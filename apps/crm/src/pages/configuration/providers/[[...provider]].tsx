import { NextPage } from "next";
import React, { useEffect, useState } from "react";

import { RootTabs } from "../../../modules/ui/root-tabs/root-tabs";
import { AppColumnsLayout } from "../../../modules/ui/app-columns-layout";
import { MailchimpAuthFrame } from "../../../modules/mailchimp/mailchimp-auth-frame/mailchimp-auth-frame";
import { createLogger } from "../../../lib/logger";
import { trpcClient } from "../../../modules/trpc/trpc-client";

const logger = createLogger({});

/**
 * todo
 * - change providers, if there is one, add tab "mailchimp" and build entire page around it
 * - add some tabs - settings & usage
 * - add lists display https://mailchimp.com/developer/marketing/api/landing-pages-content/
 * - add sync users to lists
 */
const ProvidersPage: NextPage = () => {
  const { mutateAsync } = trpcClient.mailchimp.config.setToken.useMutation();
  const { data, refetch, isFetched } =
    trpcClient.mailchimp.config.getMailchimpConfigured.useQuery();
  const { data: listsData, refetch: fetchLists } =
    trpcClient.mailchimp.audience.getLists.useQuery();

  console.log(listsData);

  useEffect(() => {
    const handleMessage = (message: MessageEvent) => {
      //todo check origin
      try {
        const payload = JSON.parse(message.data) as {
          token: string;
          type: "mailchimp_token";
          dc: string;
        };

        if (payload.type !== "mailchimp_token") {
          return;
        }

        mutateAsync({ token: payload.token, dc: payload.dc }).then(() => {
          return refetch();
        });

        // todo - save config in private metadata and show different UI
      } catch (e) {
        logger.error(e);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  });

  return (
    <div>
      <RootTabs />
      <p>
        Connect Saleor clients database with your favourite CRM platform. Currently available
        platform is Mailchimp
      </p>
      <AppColumnsLayout>
        <div />
        <div
          style={{
            height: 700,
            marginTop: 50,
            border: "1px solid #ddd",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {isFetched && data?.configured ? (
            <h2>
              Mailchimp service is configured{" "}
              <button
                onClick={() => {
                  fetchLists();
                }}
              >
                fetch lists
              </button>
            </h2>
          ) : (
            <MailchimpAuthFrame />
          )}
        </div>
      </AppColumnsLayout>
    </div>
  );
};

export default ProvidersPage;
