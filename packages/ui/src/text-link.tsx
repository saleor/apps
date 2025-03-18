import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Text, TextProps } from "@saleor/macaw-ui";
import { useRouter } from "next/router";

export interface TextLinkProps extends TextProps {
  href: string;
  newTab?: boolean;
}

const BaseTextLink = (props: TextLinkProps) => {
  return (
    <Text target="_blank" as={"a"} textDecoration={"none"} rel="noopener noreferrer" {...props}>
      <Text transition={"ease"} size={props.size} color="info1">
        {props.children}
      </Text>
    </Text>
  );
};

export const TextLink = ({ href, newTab = false, children, ...props }: TextLinkProps) => {
  const { appBridge } = useAppBridge();
  const { push } = useRouter();

  const onNewTabClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();

    if (!appBridge) {
      // eslint-disable-next-line no-console
      console.warn(
        "App bridge is not initialized, TextLink cannot be used with external links without it.",
      );
    }

    appBridge?.dispatch(
      actions.Redirect({
        to: href,
        newContext: true,
      }),
    );

    if (props.onClick) {
      props.onClick(event);
    }
  };

  const onInternalClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();

    push(href);

    if (props.onClick) {
      props.onClick(event);
    }
  };

  if (newTab) {
    return (
      <BaseTextLink href={href} onClick={onNewTabClick} {...props}>
        {children}
      </BaseTextLink>
    );
  } else {
    return (
      <BaseTextLink href={href} onClick={onInternalClick} {...props}>
        {children}
      </BaseTextLink>
    );
  }
};
