import { Box, Text } from "@saleor/macaw-ui";
import { ChevronLeft } from "lucide-react";
import { type ReactNode } from "react";

import styles from "./app-page-header.module.css";

export interface AppPageHeaderProps {
  title: ReactNode;
  /** Optional in-app back href (rendered as an anchor). */
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
}: AppPageHeaderProps): JSX.Element => (
  <Box as="header" className={styles.header} data-test-id={dataTestId}>
    <Box className={styles.start}>
      {href ? (
        <a href={href} className={styles.backLink} data-test-id="app-page-header-back">
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

AppPageHeader.displayName = "AppPageHeader";
