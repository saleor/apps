import { Box, Text } from "@saleor/macaw-ui";
import clsx from "clsx";
import { type ReactNode } from "react";

import { coerceHeaderEndActions } from "./coerce-header-end-actions";
import styles from "./detail-settings-card.module.css";

interface DetailSettingsCardProps {
  /** Omit with no `subtitle` / `headerEnd` to drop the header band (a facts-only rail card). */
  title?: ReactNode;
  /**
   * `primary` (default) — tinted `default2` header band.
   * `secondary` — flat header, same fill as the body. Supporting cards; the highlighted
   * card on the page stays `primary` (and may take `elevated`).
   */
  variant?: "primary" | "secondary";
  /** Composition hook for emphasis — pass `detailSettingsCardStyles.elevated`. */
  className?: string;
  /** Short line under the title in the header band (status, counts). Prefer `intro` for longer leading copy. */
  subtitle?: ReactNode;
  /**
   * Leading description below the header — bordered intro row. Typography is the card's
   * (`size={3}` / `default2`, the Dashboard card-intro token); pass the copy, not a `Text`.
   */
  intro?: ReactNode;
  headerEnd?: ReactNode;
  children: ReactNode;
  /** Drop content padding so list rows can use full-bleed dividers. */
  contentFlush?: boolean;
  "data-test-id"?: string;
}

export const DetailSettingsOptionalLabel = ({ children }: { children: ReactNode }): JSX.Element => (
  <Text as="span" size={2} color="default2" fontWeight="regular">
    {children}
  </Text>
);

/**
 * Title content when you need an optional mark (or other inline chrome).
 * Typography (`size={5}` / bold / `h2`) is owned by `DetailSettingsCard` — do not wrap
 * this in another heading Text.
 */
export const DetailSettingsCardTitle = ({
  children,
  optional = false,
  optionalLabel = "Optional",
}: {
  children: ReactNode;
  optional?: boolean;
  /** Shown when `optional` is true. Caller owns localization. */
  optionalLabel?: ReactNode;
}): JSX.Element => (
  <Box display="inline-flex" alignItems="baseline" gap={2} flexWrap="wrap" as="span">
    <Box as="span">{children}</Box>
    {optional ? <DetailSettingsOptionalLabel>{optionalLabel}</DetailSettingsOptionalLabel> : null}
  </Box>
);

export const DetailSettingsCardIntro = ({ children }: { children: ReactNode }): JSX.Element => (
  <Box className={styles.intro}>
    <Text size={3} color="default2">
      {children}
    </Text>
  </Box>
);

export const detailSettingsCardStyles = styles;

export const DetailSettingsCard = ({
  title,
  variant = "primary",
  className,
  subtitle,
  intro,
  headerEnd,
  children,
  contentFlush = false,
  "data-test-id": dataTestId,
}: DetailSettingsCardProps): JSX.Element => {
  const showHeader = title != null || subtitle != null || headerEnd != null;

  return (
    <Box className={clsx(styles.card, className)} data-variant={variant} data-test-id={dataTestId}>
      {showHeader ? (
        <Box
          className={clsx(
            styles.header,
            variant === "secondary" && styles.headerSecondary,
            headerEnd && styles.headerWithEnd,
          )}
        >
          <Box className={styles.headerMain}>
            {title != null ? (
              <Text size={5} fontWeight="bold" as="h2" className={styles.title}>
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text size={3} color="default2">
                {subtitle}
              </Text>
            ) : null}
          </Box>
          {headerEnd ? (
            <Box className={styles.headerEnd} data-test-id="detail-settings-card-header-end">
              {coerceHeaderEndActions(headerEnd)}
            </Box>
          ) : null}
        </Box>
      ) : null}
      {intro ? <DetailSettingsCardIntro>{intro}</DetailSettingsCardIntro> : null}
      <Box className={contentFlush ? styles.contentFlush : styles.content}>{children}</Box>
    </Box>
  );
};

DetailSettingsCard.displayName = "DetailSettingsCard";
