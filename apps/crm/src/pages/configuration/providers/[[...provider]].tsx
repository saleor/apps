import { NextPage } from "next";
import React, { useEffect, useState } from "react";

import { RootTabs } from "../../../modules/ui/root-tabs/root-tabs";
import { AppColumnsLayout } from "../../../modules/ui/app-columns-layout";
import { MailchimpAuthFrame } from "../../../modules/mailchimp/mailchimp-auth-frame/mailchimp-auth-frame";
import { createLogger } from "../../../lib/logger";
import { trpcClient } from "../../../modules/trpc/trpc-client";

const logger = createLogger({});

const ProvidersPage: NextPage = () => {
  const { mutate, mutateAsync } = trpcClient.mailchimp.setToken.useMutation();

  useEffect(() => {
    const handleMessage = (message: MessageEvent) => {
      //todo check origin
      try {
        const payload = JSON.parse(message.data) as { token: string; type: "mailchimp_token" };

        console.log(payload);

        mutateAsync({ token: payload.token }).then(() => {
          console.log("saved token");
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
          <MailchimpAuthFrame />
        </div>
      </AppColumnsLayout>
    </div>
  );
};

export default ProvidersPage;
