import { Box } from "@saleor/macaw-ui";
import React from "react";

/**
 * Layout for Dashboard WIDGET extensions. Unlike {@link AppLayout} it renders no
 * navigation and does not force a viewport height, so the iframe can be
 * auto-resized to its content via `useWidgetAutoResize`.
 *
 * It adds no padding on purpose: the Dashboard already pads the widget iframe.
 * Padding here would double the inset and, because `useWidgetAutoResize` measures
 * `getBoundingClientRect().height` (which excludes ancestor padding), also size
 * the iframe too short and clip the content.
 */
export const WidgetLayout = ({ children }: { children: React.ReactNode }) => {
  return <Box>{children}</Box>;
};
