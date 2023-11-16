import { Box } from "@saleor/macaw-ui";
import React, { ComponentProps } from "react";
import styles from "./mailchimp-auth-frame.module.css";

export const MailchimpAuthFrame = (props: ComponentProps<typeof Box>) => {
  return (
    <Box {...props}>
      <iframe src="/configuration/mailchimp/auth" className={styles.frame} />
    </Box>
  );
};
