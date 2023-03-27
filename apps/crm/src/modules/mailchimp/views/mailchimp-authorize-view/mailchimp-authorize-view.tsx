import { MailchimpAuthFrame } from "../../mailchimp-auth-frame/mailchimp-auth-frame";
import React, { useEffect } from "react";
import { trpcClient } from "../../../trpc/trpc-client";
import { createLogger } from "../../../../lib/logger";

const logger = createLogger({});

export const MailchimpAuthorizeView = () => {
  const { mutateAsync } = trpcClient.mailchimp.config.setToken.useMutation();
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
          // todo redirect
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
      <MailchimpAuthFrame />
    </div>
  );
};
