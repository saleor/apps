import { HTMLAttributes, HTMLProps } from "react";
import MailchimpLogo from "../../../assets/mailchimp.svg";
import clsx from "clsx";
import styles from "./login-with-mailchimp-button.module.css";

export const LoginWithMailchimpButton = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLButtonElement>) => {
  return (
    <button className={clsx(className, styles.button)} {...props}>
      <img className={styles.logo} src={MailchimpLogo.src} alt="Mailchimp logo" />
      <span className={styles.text}>Log in with Mailchimp</span>
    </button>
  );
};
