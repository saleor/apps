import { Box, Text } from "@saleor/macaw-ui";
import clsx from "clsx";
import { ChevronLeft } from "lucide-react";
import { type ReactNode } from "react";

import { AppLink } from "../app-link/app-link";
import styles from "./app-page-header.module.css";

export interface AppPageHeaderProps {
  title: ReactNode;
  /**
   * Control shown where the title would be, for a page whose subject the user can change from
   * here — a record switcher, say. `title` stays as the page's heading, visually hidden: the
   * control is how you leave the page, not what tells you which one you are on.
   */
  titleControl?: ReactNode;
  /** Optional in-app back href (rendered as an anchor, navigated client-side). */
  href?: string;
  hrefTitle?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  "data-test-id"?: string;
}

export const AppPageHeader = ({
  title,
  titleControl,
  href,
  hrefTitle,
  actions,
  children,
  "data-test-id": dataTestId,
}: AppPageHeaderProps): JSX.Element => {
  return (
    <Box as="header" className={styles.header} data-test-id={dataTestId}>
      <Box className={styles.start}>
        {href ? (
          <AppLink href={href} className={styles.backLink} data-test-id="app-page-header-back">
            <ChevronLeft size={16} aria-hidden />
            {hrefTitle ? (
              <Text size={2} as="span">
                {hrefTitle}
              </Text>
            ) : null}
          </AppLink>
        ) : null}
        <Text
          size={5}
          fontWeight="bold"
          as="h1"
          className={clsx(styles.title, titleControl && styles.titleVisuallyHidden)}
        >
          {title}
        </Text>
        {titleControl ? <Box className={styles.titleControl}>{titleControl}</Box> : null}
        {children}
      </Box>
      {actions ? <Box className={styles.actions}>{actions}</Box> : null}
    </Box>
  );
};

AppPageHeader.displayName = "AppPageHeader";
