import { Box, Text } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

import { type SettingsOwnership, SettingsOwnershipChip } from "../settings-ownership-chip";
import styles from "./settings-section.module.css";

export interface SettingsSectionProps {
  title: ReactNode;
  description?: ReactNode;
  ownership?: SettingsOwnership;
  /** Right-aligned actions in the header (e.g. Add). */
  headerEnd?: ReactNode;
  children: ReactNode;
  id?: string;
  "data-test-id"?: string;
}

/**
 * Settings hub card: title + ownership chip + description, then body rows.
 */
export const SettingsSection = ({
  title,
  description,
  ownership,
  headerEnd,
  children,
  id,
  "data-test-id": dataTestId,
}: SettingsSectionProps): JSX.Element => (
  <Box
    as="section"
    id={id}
    className={styles.section}
    data-test-id={dataTestId}
    backgroundColor="default1"
    borderWidth={1}
    borderStyle="solid"
    borderColor="default1"
    borderRadius={3}
    overflow="hidden"
  >
    <Box
      className={styles.header}
      paddingX={6}
      paddingTop={5}
      paddingBottom={4}
      display="flex"
      flexDirection="column"
      gap={2}
    >
      <Box className={styles.titleRow}>
        <Box className={styles.titleStart}>
          <Text size={5} fontWeight="bold" as="h2">
            {title}
          </Text>
          {ownership ? <SettingsOwnershipChip ownership={ownership} /> : null}
        </Box>
        {headerEnd ? <Box flexShrink="0">{headerEnd}</Box> : null}
      </Box>
      {description ? (
        <Text size={2} color="default2" className={styles.description}>
          {description}
        </Text>
      ) : null}
    </Box>
    <Box className={styles.body} display="flex" flexDirection="column">
      {children}
    </Box>
  </Box>
);

SettingsSection.displayName = "SettingsSection";

export interface SettingsFieldStackProps {
  children: ReactNode;
  intro?: ReactNode;
}

/** Padded field stack inside a SettingsSection body. */
export const SettingsFieldStack = ({ children, intro }: SettingsFieldStackProps): JSX.Element => (
  <Box paddingX={6} paddingY={5} display="flex" flexDirection="column" gap={4}>
    {intro}
    {children}
  </Box>
);

SettingsFieldStack.displayName = "SettingsFieldStack";
