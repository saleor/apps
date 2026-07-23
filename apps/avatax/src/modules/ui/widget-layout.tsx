import { Box } from "@saleor/macaw-ui";
import React from "react";

/**
 * Layout for Dashboard WIDGET extensions. Unlike {@link AppLayout} it renders no
 * navigation and does not force a viewport height, so the iframe can be
 * auto-resized to its content via `useWidgetAutoResize`.
 */
export const WidgetLayout = ({ children }: { children: React.ReactNode }) => {
  return <Box padding={4}>{children}</Box>;
};
