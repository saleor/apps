import { Box, Text } from "@saleor/macaw-ui";
import { ChevronDown } from "lucide-react";
import { type ReactNode, useId, useState } from "react";

import styles from "./aside-info-card.module.css";

export interface AsideInfoCardFold {
  title: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export interface AsideInfoCardProps {
  /** Optional title in the body (not a tinted header band). */
  title?: ReactNode;
  children: ReactNode;
  /** Optional foldable footer for secondary how-to content. */
  fold?: AsideInfoCardFold;
  "data-test-id"?: string;
}

/**
 * Minimal info / legend card for settings left rails.
 * Flat body (no tinted header) + optional disclose footer — distinct from SettingsSection.
 */
export const AsideInfoCard = ({
  title,
  children,
  fold,
  "data-test-id": dataTestId,
}: AsideInfoCardProps): JSX.Element => {
  const foldPanelId = useId();
  const [expanded, setExpanded] = useState(fold?.defaultExpanded ?? false);

  return (
    <Box className={styles.card} data-test-id={dataTestId}>
      <Box className={styles.body}>
        {title ? (
          <Text as="h2" size={3} fontWeight="bold" className={styles.title}>
            {title}
          </Text>
        ) : null}
        {children}
      </Box>
      {fold ? (
        <Box className={styles.fold} data-expanded={expanded ? "true" : "false"}>
          <button
            type="button"
            className={styles.foldTrigger}
            aria-expanded={expanded}
            aria-controls={foldPanelId}
            data-test-id={
              dataTestId ? `${dataTestId}-fold-trigger` : "aside-info-card-fold-trigger"
            }
            onClick={() => setExpanded((current) => !current)}
          >
            <Text size={2} fontWeight="medium" className={styles.foldTriggerLabel}>
              {fold.title}
            </Text>
            <Box
              className={`${styles.chevron} ${
                expanded ? styles.chevronExpanded : styles.chevronCollapsed
              }`}
              aria-hidden
            >
              <ChevronDown size={14} strokeWidth={2} />
            </Box>
          </button>
          {expanded ? (
            <Box
              id={foldPanelId}
              className={styles.foldPanel}
              data-test-id={dataTestId ? `${dataTestId}-fold-panel` : "aside-info-card-fold-panel"}
            >
              {fold.children}
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
};

AsideInfoCard.displayName = "AsideInfoCard";
