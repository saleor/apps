import MailchimpLogo from "../../../assets/mailchimp.svg";
import { Button, ButtonProps } from "@saleor/macaw-ui";

export const LoginWithMailchimpButton = ({ children, ...props }: ButtonProps) => {
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
