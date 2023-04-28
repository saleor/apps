import { TextProps, Text } from "@saleor/macaw-ui/next";
import Link from "next/link";

interface TextLinkProps extends TextProps {
  href: string;
}

export const TextLink = (props: TextLinkProps) => {
  return (
    <Text textDecoration={"underline"} variant="bodyStrong" {...props}>
      <Link href={props.href}>{props.children}</Link>
    </Text>
  );
};
