import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Text, TextProps } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";

export interface TextLinkProps extends TextProps {
  href: string;
  newTab?: boolean;
}

const BaseTextLink = (props: TextLinkProps) => {
  return (
    <Text
      target="_blank"
      as={"a"}
      textDecoration={"underline"}
      variant={"bodyStrong"}
      rel="noopener noreferrer"
      {...props}
    >
      <Text
        __margin={0}
        color={"text2Decorative"} /* TODO Color not applied - looks like Macaw issue*/
      >
        {props.children}
      </Text>
    </Text>
  );
};

export const TextLink = ({ href, newTab = false, children, ...props }: TextLinkProps) => {
  const { appBridge } = useAppBridge();
  const { push } = useRouter();

  const onExternalClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();

    if (!appBridge) {
      console.warn(
        "App bridge is not initialized, TextLink cannot be used with external links without it."
      );
    }

    appBridge?.dispatch(
      actions.Redirect({
        to: href,
        newContext: true,
      })
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
      <BaseTextLink href={href} onClick={onExternalClick} {...props}>
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
