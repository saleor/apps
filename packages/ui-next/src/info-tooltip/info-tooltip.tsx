import { Tooltip } from "@saleor/macaw-ui";
import { Info } from "lucide-react";
import { type ReactNode } from "react";

import { iconSize, iconStrokeWidthBySize } from "../icons/icon-size";
import { TooltipBody } from "../tooltip/tooltip-body";
import styles from "./info-tooltip.module.css";

export interface InfoTooltipProps {
  /** The explanation. One or two sentences — past that it belongs on the page. */
  children: ReactNode;
  /**
   * What the glyph explains, for screen readers, e.g. "About order notifications". The tooltip text
   * itself is announced through `aria-describedby` once the trigger takes focus.
   */
  label: string;
  "data-test-id"?: string;
}

/**
 * Info glyph that carries a caveat about the label it follows.
 *
 * For the sentence that is worth having somewhere but not worth a line of its own: a group of rows
 * that behaves unlike the others, a field whose effect is not obvious. Anything a merchant has to
 * read to get the setting right belongs on the page instead — this is deliberately easy to miss.
 */
export const InfoTooltip = ({
  children,
  label,
  "data-test-id": dataTestId,
}: InfoTooltipProps): JSX.Element => (
  <Tooltip>
    <Tooltip.Trigger>
      {/* A button, so the explanation is reachable by keyboard and not only by hover. */}
      <button type="button" className={styles.trigger} aria-label={label} data-test-id={dataTestId}>
        <Info size={iconSize.small} strokeWidth={iconStrokeWidthBySize.small} aria-hidden />
      </button>
    </Tooltip.Trigger>
    <TooltipBody>{children}</TooltipBody>
  </Tooltip>
);

InfoTooltip.displayName = "InfoTooltip";
