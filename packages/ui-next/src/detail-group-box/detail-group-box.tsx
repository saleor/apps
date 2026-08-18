import { Accordion, Box } from "@saleor/macaw-ui";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";

import { iconSize, iconStrokeWidthBySize } from "../icons";
import styles from "./detail-group-box.module.css";

export interface DetailGroupBoxProps {
  groupId: string;
  headerStart: ReactNode;
  headerEnd?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  dataTestId?: string;
  dataTestIsPrivate?: boolean;
  marginTop?: 0 | 1 | 2 | 3 | 4;
  /** Optional test id for the expand/collapse control. */
  triggerButtonTestId?: string;
  /**
   * `primary` — nested list row (tinted header).
   * `secondary` — standalone foldable card (white header; SEO-style).
   * `card` — top-level section card (tinted header, card paddings).
   * `flush` — full-bleed fold inside a parent card (no own border/radius;
   *   secondary-style header). Use as a direct `SettingsSection` body sibling
   *   so the section’s `body > * + *` rule draws the top separator.
   */
  variant?: "primary" | "secondary" | "card" | "flush";
}

export const DetailGroupBox = ({
  groupId,
  headerStart,
  headerEnd,
  children,
  defaultExpanded = false,
  dataTestId,
  dataTestIsPrivate,
  marginTop,
  triggerButtonTestId,
  variant = "primary",
}: DetailGroupBoxProps): JSX.Element => {
  const [expanded, setExpanded] = useState<string | undefined>(
    defaultExpanded ? groupId : undefined,
  );
  const isExpanded = expanded === groupId;
  const isSecondary = variant === "secondary";
  const isCard = variant === "card";
  const isFlush = variant === "flush";
  const usesSecondaryHeader = isSecondary || isFlush;
  const resolvedMarginTop = marginTop ?? (isCard || isFlush ? 0 : 4);

  return (
    <Box
      marginTop={resolvedMarginTop}
      data-test-id={dataTestId}
      data-test-is-private={dataTestIsPrivate}
      data-expanded={isExpanded ? "true" : "false"}
    >
      <Accordion value={expanded} onValueChange={setExpanded}>
        <Accordion.Item value={groupId}>
          <Box
            backgroundColor={usesSecondaryHeader || isCard ? "default1" : "default2"}
            borderRadius={isFlush || isSecondary || isCard ? undefined : 4}
            borderStyle={isFlush ? undefined : "solid"}
            borderColor={isFlush ? undefined : "default1"}
            borderWidth={isFlush ? undefined : 1}
            overflow="hidden"
            className={clsx(
              isSecondary && styles.surfaceSecondary,
              isCard && styles.surfaceCard,
              isFlush && styles.surfaceFlush,
            )}
          >
            <Box
              className={clsx(
                styles.header,
                isCard && styles.headerCard,
                isCard && headerEnd && styles.headerCardWithEnd,
                usesSecondaryHeader && styles.headerSecondary,
                usesSecondaryHeader && isExpanded && styles.headerSecondaryExpanded,
              )}
              backgroundColor={usesSecondaryHeader ? "default1" : "default2"}
            >
              {/* Trigger is only the title side so headerEnd actions don't toggle. */}
              <Accordion.Trigger className={styles.trigger}>
                <Box display="flex" alignItems="center" gap={2} minWidth={0} width="100%">
                  <Box
                    className={clsx(styles.chevron, isExpanded && styles.chevronOpen)}
                    data-test-id={triggerButtonTestId}
                  >
                    <ChevronDown size={iconSize.small} strokeWidth={iconStrokeWidthBySize.small} />
                  </Box>
                  <Box minWidth={0} flexGrow="1">
                    {headerStart}
                  </Box>
                </Box>
              </Accordion.Trigger>
              {headerEnd ? (
                <Box
                  display="flex"
                  alignItems="center"
                  gap={4}
                  flexShrink="0"
                  className={styles.headerEnd}
                >
                  {headerEnd}
                </Box>
              ) : null}
            </Box>

            <Accordion.Content>
              <Box
                className={clsx(
                  styles.content,
                  usesSecondaryHeader && styles.contentSecondary,
                  isCard && styles.contentCard,
                )}
                borderTopStyle="solid"
                borderColor="default1"
                borderTopWidth={usesSecondaryHeader ? 0 : 1}
                backgroundColor="default1"
              >
                {children}
              </Box>
            </Accordion.Content>
          </Box>
        </Accordion.Item>
      </Accordion>
    </Box>
  );
};

DetailGroupBox.displayName = "DetailGroupBox";
