import { TextProps, Text } from "@saleor/macaw-ui/next";
import Link from "next/link";

interface TextLinkProps extends TextProps {
  href: string;
  openNewTab?: boolean;
}

export const TextLink = (props: TextLinkProps) => {
  // TODO: FIXME: For some reason the link is not opened in a new tab, investigate
  return (
    <Text textDecoration={"underline"} variant="bodyStrong" {...props}>
      {props.openNewTab ? (
        <a href={props.href} target="_blank" rel="noopener noreferrer">
          {props.children}
        </a>
      ) : (
        <Link href={props.href}>{props.children}</Link>
      )}{" "}
    </Text>
  );
};
