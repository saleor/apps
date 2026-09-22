import { Box, Text, Toggle, Tooltip } from "@saleor/macaw-ui";
import clsx from "clsx";
import { type KeyboardEvent, type ReactNode } from "react";

import { TooltipBody } from "../tooltip/tooltip-body";
import styles from "./toggle-chip.module.css";

export interface ToggleChipProps {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  /**
   * States what is on or off, e.g. "Sending to customers". Word the two states in parallel so the
   * pair reads as one setting rather than two facts.
   */
  children: ReactNode;
  /** What the state means, and what changes by flipping it. On hover and on focus. */
  tooltip?: ReactNode;
  disabled?: boolean;
  /**
   * `warning` gives the pill a warning border while it is off, for a state a merchant would want to
   * catch on sight — nothing is sent, nothing is collected. Keep it for consequences, or it becomes
   * decoration.
   */
  tone?: "neutral" | "warning";
  "data-test-id"?: string;
}

/**
 * A state and its switch in one pill: says what is happening, and flips it in place.
 *
 * Dashboard's own shape for this (the variant selection switch on a product type's attribute rows).
 * Preferred over a `Callout` with a button when the state is one line long and the fix is one click:
 * a callout takes a band across the page to say what a pill says inline, and a merchant who has read
 * it once has to keep scrolling past it. Use `Callout` instead when the fix is elsewhere, or when
 * what went wrong needs a sentence to explain.
 */
export const ToggleChip = ({
  pressed,
  onPressedChange,
  children,
  tooltip,
  disabled,
  tone = "neutral",
  "data-test-id": dataTestId,
}: ToggleChipProps): JSX.Element => {
  const toggle = () => {
    if (!disabled) {
      onPressedChange(!pressed);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };

  /*
   * `role="button"` on a Box rather than a real `<button>`: macaw's `Toggle` is itself a button, and
   * nesting one inside another is invalid markup no browser agrees on.
   */
  const chip = (
    <Box
      className={clsx(styles.chip, tone === "warning" && !pressed && styles.warning)}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={pressed}
      aria-disabled={disabled || undefined}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      data-test-id={dataTestId}
    >
      <Box className={styles.toggle} aria-hidden>
        <Toggle
          pressed={pressed}
          onPressedChange={() => undefined}
          disabled={disabled}
          tabIndex={-1}
        />
      </Box>
      <Text as="span" size={2} className={styles.label}>
        {children}
      </Text>
    </Box>
  );

  if (!tooltip) {
    return chip;
  }

  return (
    <Tooltip>
      <Tooltip.Trigger>{chip}</Tooltip.Trigger>
      <TooltipBody>{tooltip}</TooltipBody>
    </Tooltip>
  );
};

ToggleChip.displayName = "ToggleChip";
