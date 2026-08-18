/**
 * Lucide icon size tokens — same values as Dashboard `@dashboard/components/icons`.
 *
 * @example
 * import { Plug } from "lucide-react";
 * import { iconSize, iconStrokeWidthBySize } from "@saleor/apps-ui-next";
 *
 * <Plug size={iconSize.small} strokeWidth={iconStrokeWidthBySize.small} />
 */
export const iconSize = {
  small: 16,
  medium: 20,
  large: 24,
} as const;

/**
 * Stroke width by icon size. Smaller icons use a thicker stroke for visibility.
 */
export const iconStrokeWidthBySize = {
  small: 2,
  medium: 1.5,
  large: 1.5,
} as const;

/** Default stroke for medium/large icons (Dashboard `iconStrokeWidth`). */
export const iconStrokeWidth = 1.5;

export type IconSize = keyof typeof iconSize;
