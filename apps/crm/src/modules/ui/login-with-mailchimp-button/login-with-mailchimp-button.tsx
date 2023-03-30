import { HTMLAttributes } from "react";
import MailchimpLogo from "../../../assets/mailchimp.svg";
import { Button } from "@saleor/macaw-ui/next";

export const LoginWithMailchimpButton = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLButtonElement>) => {
  return (
    <Button
      variant="secondary"
      icon={<img alt="Mailchimp Logo" width={25} src={MailchimpLogo.src} />}
      size="large"
      {...props}
    >
      Log in with Mailchimp
    </Button>
  );
};
