import { Box, Text, Toggle } from "@saleor/macaw-ui";
import { type KeyboardEvent, type ReactNode } from "react";

import styles from "./detail-setting-toggle-row.module.css";

export interface DetailSettingToggleRowProps {
  title: ReactNode;
  /** What turning it on does, and when a store wants that. Always present — the title is short. */
  description: ReactNode;
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  disabled?: boolean;
  testId?: string;
  /** Inline callout under the title row (stays inside card padding). */
  notice?: ReactNode;
  /** Fields that only apply while the setting is on. Wrap each in `DetailSettingNestedField`. */
  children?: ReactNode;
}

/**
 * Boolean setting row: title and description left, `Toggle` right.
 *
 * The Dashboard's own shape for this (channel order settings), and the reason to prefer it over a
 * checkbox with a sentence for a label: the label stays short enough to scan a column of them, and
 * the explanation is a line the merchant can read without re-reading the control.
 */
export const DetailSettingToggleRow = ({
  title,
  description,
  pressed,
  onPressedChange,
  disabled,
  testId,
  notice,
  children,
}: DetailSettingToggleRowProps): JSX.Element => {
  const toggle = () => {
    if (!disabled) {
      onPressedChange(!pressed);
    }
  };

  const handleCopyKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };

  return (
    <Box className={styles.row} data-test-id={testId}>
      <Box className={styles.header}>
        {/* role=button (not <button>): descriptions carry pills, which are divs; Toggle is mouse-only to avoid dual tab stops */}
        <Box
          className={styles.copyButton}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-pressed={pressed}
          aria-disabled={disabled || undefined}
          onClick={toggle}
          onKeyDown={handleCopyKeyDown}
        >
          <Text size={3} fontWeight="medium" as="span">
            {title}
          </Text>
          <Text size={2} color="default2" as="span">
            {description}
          </Text>
        </Box>
        <Toggle
          pressed={pressed}
          onPressedChange={onPressedChange}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden
        />
      </Box>
      {notice ? <Box className={styles.notice}>{notice}</Box> : null}
      {children ? <Box className={styles.nested}>{children}</Box> : null}
    </Box>
  );
};

DetailSettingToggleRow.displayName = "DetailSettingToggleRow";

export const DetailSettingNestedField = ({ children }: { children: ReactNode }): JSX.Element => (
  <Box className={styles.nestedField}>{children}</Box>
);

DetailSettingNestedField.displayName = "DetailSettingNestedField";
