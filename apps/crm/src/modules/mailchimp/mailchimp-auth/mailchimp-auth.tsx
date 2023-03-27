import { LoginWithMailchimpButton } from "../../ui/login-with-mailchimp-button/login-with-mailchimp-button";
import React from "react";
import styles from "./mailchimp-auth.module.css";

export const MailchimpAuth = () => {
  return (
    <div className={styles.root}>
      <a href="/api/auth/mailchimp">
        <LoginWithMailchimpButton />
      </a>
    </div>
  );
};
