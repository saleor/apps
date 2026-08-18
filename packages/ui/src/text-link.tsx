import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Text, type TextProps } from "@saleor/macaw-ui";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/router";

import styles from "./text-link.module.css";

export interface TextLinkProps extends TextProps {
  href: string;
  newTab?: boolean;
}

/**
 * In-product text link.
 * Default: primary text color (`default1`), underline on hover.
 * Pass `color` only as an intentional exemption (e.g. marketing emphasis).
 * External (`newTab`) links get a Lucide `ExternalLink` icon sized to `1em`.
 *
 * Typography: omit `size` to inherit the surrounding text (required for inline
 * links inside descriptions). Pass `size` only for standalone links that are not
 * nested in sized copy.
 */
export const TextLink = ({
  href,
  newTab = false,
  children,
  color = "default1",
  size,
  className,
  onClick,
  ...props
}: TextLinkProps) => {
  const { appBridge } = useAppBridge();
  const { push } = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();

    if (newTab) {
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
    } else {
      push(href);
    }

    onClick?.(event);
  };

  const inheritTypography = size === undefined;

  return (
    <Text
      as="a"
      href={href}
      rel={newTab ? "noopener noreferrer" : undefined}
      color={color}
      size={size}
      className={[
        styles.link,
        inheritTypography ? styles.matchSurroundingText : undefined,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
      {...props}
    >
      {children}
      {newTab ? <ExternalLink className={styles.externalIcon} aria-hidden strokeWidth={2} /> : null}
    </Text>
  );
};
