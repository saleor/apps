import clsx from "clsx";

import styles from "./count-pill.module.css";

export interface CountPillValue {
  value: number;
  /** `true` renders `99+` — the list is longer than the number the API would count exactly. */
  hasMore: boolean;
}

export interface CountPillProps {
  /**
   * Nothing to show (`undefined`) renders nothing. A real zero still renders: an empty section is
   * a count, whereas a Filters button with nothing applied is not.
   */
  count: CountPillValue | undefined;
  /**
   * Inset border and primary text. The Filters button sets this whenever the pill is visible.
   * An unselected tab leaves it off.
   */
  active?: boolean;
  "data-test-id"?: string;
}

const getCountLabel = (count: CountPillValue | undefined): string | null => {
  if (!count || !Number.isFinite(count.value)) {
    return null;
  }

  return count.hasMore ? `${count.value}+` : `${count.value}`;
};

/** Filters-button case: zero means nothing is applied, so the pill stays hidden. */
export const countPillFromNumber = (value: number): CountPillValue | undefined =>
  Number.isFinite(value) && value > 0 ? { value, hasMore: false } : undefined;

/**
 * Compact count, the pill Dashboard puts on its Filters button and beside model-type tabs.
 *
 * A heading that names a group uses the same pill so "how many" reads as a chip, not as a second
 * word in the title.
 */
export const CountPill = ({
  count,
  active = false,
  "data-test-id": dataTestId,
}: CountPillProps): JSX.Element | null => {
  const label = getCountLabel(count);

  if (!label) {
    return null;
  }

  return (
    <span
      className={clsx(styles.pill, active && styles.active)}
      data-active={active ? "true" : "false"}
      data-test-id={dataTestId}
    >
      {label}
    </span>
  );
};

CountPill.displayName = "CountPill";
