"use client";

import { Box, type BoxProps } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

/**
 * Minimal replica of the dashboard's DashboardCard compound. The dashboard package isn't
 * available in the apps repo so we wrap macaw-ui's Box with the same Root/Header/Content
 * sub-components used by the WelcomePageOnboarding accordion.
 */
const Root = ({ children, ...props }: BoxProps & { children: ReactNode }) => (
  <Box backgroundColor="default1" {...props}>
    {children}
  </Box>
);

const Header = ({ children, ...props }: BoxProps & { children: ReactNode }) => (
  <Box display="flex" alignItems="center" justifyContent="space-between" {...props}>
    {children}
  </Box>
);

const Content = ({ children, ...props }: BoxProps & { children: ReactNode }) => (
  <Box {...props}>{children}</Box>
);

export const DashboardCard = Object.assign(Root, { Header, Content });
