import { MailchimpAuthFrame } from "../../auth/mailchimp-auth-frame/mailchimp-auth-frame";
import React, { useEffect } from "react";
import { trpcClient } from "../../../trpc/trpc-client";
import { createLogger } from "@saleor/apps-shared";

const logger = createLogger({});

export const MailchimpAuthorizeView = (props: { onSuccess(): void }) => {
  const { mutateAsync } = trpcClient.mailchimp.config.setToken.useMutation();

  useEffect(() => {
    const handleMessage = (message: MessageEvent) => {
      if (message.origin !== window.location.origin) {
        return;
      }

      try {
        const payload = message.data as {
          token: string;
          type: "mailchimp_token";
          dc: string;
        };

        if (payload.type !== "mailchimp_token") {
          return;
        }

        mutateAsync({ token: payload.token, dc: payload.dc }).then(() => {
          logger.debug("Saved token in metadata");

          props.onSuccess();
        });

        // todo - save config in private metadata and show different UI
      } catch (e) {
        logger.error(e);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  });

  // todo calculate dynamically
  return <MailchimpAuthFrame __height={900} />;
};
