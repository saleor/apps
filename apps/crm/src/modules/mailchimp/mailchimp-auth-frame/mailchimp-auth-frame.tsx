import React from "react";
import styles from "./mailchimp-auth-frame.module.css";

export const MailchimpAuthFrame = () => {
  return <iframe src="/configuration/mailchimp/auth" className={styles.frame} />;
};
