import { Box, Text } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

import styles from "./settings-page-content.module.css";

export interface SettingsPageContentProps {
  /** Optional section title in the left rail (Site Settings–style). */
  title?: ReactNode;
  /** Explainer in the left rail; forms go in `children` on the right. */
  description?: ReactNode;
  /**
   * Extra left-rail content (e.g. `AsideInfoCard` legend).
   * Stacks below `title` / `description` — does not replace them.
   */
  aside?: ReactNode;
  children: ReactNode;
  /** Override default padding when nested under a custom shell. */
  disablePadding?: boolean;
  "data-test-id"?: string;
}

/**
 * Settings hub chrome: left rail (title + description + optional aside) + right forms column.
 * Mirrors Dashboard Site Settings (`1fr 3fr`).
 */
export const SettingsPageContent = ({
  title,
  description,
  aside,
  children,
  disablePadding = false,
  "data-test-id": dataTestId,
}: SettingsPageContentProps): JSX.Element => {
  const hasAside = aside != null || title != null || description != null;

  return (
    <Box
      className={styles.root}
      paddingX={disablePadding ? 0 : 6}
      paddingTop={disablePadding ? 0 : 6}
      paddingBottom={disablePadding ? 0 : 10}
      width="100%"
      data-test-id={dataTestId}
    >
      {hasAside ? (
        <Box className={styles.aside} display="flex" flexDirection="column" gap={5}>
          {title != null || description != null ? (
            <Box display="flex" flexDirection="column" gap={2}>
              {title ? (
                <Text size={3} fontWeight="bold" as="h2">
                  {title}
                </Text>
              ) : null}
              {description ? (
                <Text size={3} color="default2" className={styles.description}>
                  {description}
                </Text>
              ) : null}
            </Box>
          ) : null}
          {aside}
        </Box>
      ) : null}
      <Box
        className={styles.main}
        display="flex"
        flexDirection="column"
        gap={5}
        width="100%"
        __gridColumn={hasAside ? undefined : "1 / -1"}
      >
        {children}
      </Box>
    </Box>
  );
};

SettingsPageContent.displayName = "SettingsPageContent";
