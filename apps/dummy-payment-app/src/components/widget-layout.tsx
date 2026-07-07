import { Box } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

interface WidgetLayoutProps {
  children: ReactNode;
}

/**
 * Layout for dashboard WIDGET extensions. Unlike {@link AppLayout} it renders no
 * navigation tabs and does not force a `100vh` height, so the iframe can be
 * auto-resized to its content via `useWidgetAutoResize`.
 */
export function WidgetLayout({ children }: WidgetLayoutProps) {
  return <Box>{children}</Box>;
}
