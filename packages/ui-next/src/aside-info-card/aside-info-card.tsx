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
  /**
   * Turn the title into a disclosure for the whole card. For a rail card that earns its length the
   * first time and is in the way afterwards — an explanation of a mechanism, rather than a hint a
   * merchant re-reads while filling the form next to it. Requires `title`.
   */
  collapsible?: boolean;
  /**
   * Start closed. Nothing remembers the state between visits, so this trades the copy being read at
   * all for a rail that stays short — right when the card explains rather than instructs, and the
   * settings beside it are usable without it.
   */
  defaultCollapsed?: boolean;
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
  collapsible,
  defaultCollapsed = false,
  fold,
  "data-test-id": dataTestId,
}: AsideInfoCardProps): JSX.Element => {
  const foldPanelId = useId();
  const bodyId = useId();
  const [expanded, setExpanded] = useState(fold?.defaultExpanded ?? false);
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  const isCollapsible = Boolean(collapsible && title);
  const showsContent = !isCollapsible || isOpen;

  return (
    <Box className={styles.card} data-test-id={dataTestId}>
      {isCollapsible ? (
        <Text as="h2" size={3} fontWeight="bold" className={styles.title}>
          <button
            type="button"
            className={styles.cardTrigger}
            aria-expanded={isOpen}
            aria-controls={bodyId}
            data-test-id={dataTestId ? `${dataTestId}-trigger` : "aside-info-card-trigger"}
            onClick={() => setIsOpen((current) => !current)}
          >
            {title}
            <Box
              className={`${styles.chevron} ${
                isOpen ? styles.chevronExpanded : styles.chevronCollapsed
              }`}
              aria-hidden
            >
              <ChevronDown size={14} strokeWidth={2} />
            </Box>
          </button>
        </Text>
      ) : null}
      {showsContent ? (
        <Box
          id={isCollapsible ? bodyId : undefined}
          className={`${styles.body} ${isCollapsible ? styles.bodyUnderTrigger : ""}`}
        >
          {title && !isCollapsible ? (
            <Text as="h2" size={3} fontWeight="bold" className={styles.title}>
              {title}
            </Text>
          ) : null}
          {children}
        </Box>
      ) : null}
      {fold && showsContent ? (
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
