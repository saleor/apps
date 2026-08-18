import { Box, Text } from "@saleor/macaw-ui";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/router";
import { type MouseEvent, type ReactNode } from "react";

import styles from "./app-page-header.module.css";

export interface AppPageHeaderProps {
  title: ReactNode;
  /** Optional in-app back href (rendered as an anchor, navigated client-side). */
  href?: string;
  hrefTitle?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  "data-test-id"?: string;
}

export const AppPageHeader = ({
  title,
  href,
  hrefTitle,
  actions,
  children,
  "data-test-id": dataTestId,
}: AppPageHeaderProps): JSX.Element => {
  const router = useRouter();

  /**
   * Apps run inside Dashboard's iframe, whose URL carries the AppBridge handshake params.
   * Letting the browser follow the anchor reloads the frame without them, so the app comes
   * back up unauthenticated - the route has to change client-side.
   */
  const handleBackClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!href) {
      return;
    }

    event.preventDefault();
    void router.push(href);
  };

  return (
    <Box as="header" className={styles.header} data-test-id={dataTestId}>
      <Box className={styles.start}>
        {href ? (
          <a
            href={href}
            className={styles.backLink}
            onClick={handleBackClick}
            data-test-id="app-page-header-back"
          >
            <ChevronLeft size={16} aria-hidden />
            {hrefTitle ? (
              <Text size={2} as="span">
                {hrefTitle}
              </Text>
            ) : null}
          </a>
        ) : null}
        <Text size={5} fontWeight="bold" as="h1" className={styles.title}>
          {title}
        </Text>
        {children}
      </Box>
      {actions ? <Box className={styles.actions}>{actions}</Box> : null}
    </Box>
  );
};

AppPageHeader.displayName = "AppPageHeader";
