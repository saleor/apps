import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { TextProps, Text } from "@saleor/macaw-ui/next";
import Link from "next/link";

interface TextLinkProps extends TextProps {
  href: string;
  openNewTab?: boolean;
}

export const TextLink = ({ href, openNewTab, children, props }: TextLinkProps) => {
  const { appBridge } = useAppBridge();

  const onClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();

    appBridge?.dispatch(
      actions.Redirect({
        to: href,
        newContext: true,
      })
    );
  };

  return (
    <Text textDecoration="underline" variant="bodyStrong" {...props}>
      {openNewTab ? (
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
          {children}
        </a>
      ) : (
        <Link href={href}>{children}</Link>
      )}
    </Text>
  );
};
