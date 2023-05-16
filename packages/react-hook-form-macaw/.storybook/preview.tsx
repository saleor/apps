import "@saleor/macaw-ui/next/style";
import "./styles.css";

import React from "react";
import { DocsContainer, DocsContainerProps } from "@storybook/blocks";
import { PropsWithChildren } from "react";
import { Box, ThemeProvider, useTheme } from "@saleor/macaw-ui/next";

type MacawDocsContainerProps = {
  [K in keyof DocsContainerProps]: K extends "context"
    ? DocsContainerProps[K] & { store: Record<string, any> }
    : DocsContainerProps[K];
};

const MacawDocsContainer = ({ children, ...props }: PropsWithChildren<MacawDocsContainerProps>) => {
  return (
    <ThemeProvider defaultTheme={props.context.store.globals.globals.theme}>
      <ThemeSwitcher theme={props.context.store.globals.globals.theme}>
        <DocsContainer {...props}>{children}</DocsContainer>
      </ThemeSwitcher>
    </ThemeProvider>
  );
};

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      date: /Date$/,
    },
  },
  docs: {
    autodocs: "tag",
    container: MacawDocsContainer,
  },
  options: {
    storySort: (a, b) => {
      const parsedA = a.importPath.match(/([0-9]+)/);
      const parsedB = b.importPath.match(/([0-9]+)/);
      const orderA = parsedA ? parsedA[0] : "0";
      const orderB = parsedB ? parsedB[0] : "0";

      return orderA === orderB ? 0 : orderB.localeCompare(orderA, undefined, { numeric: true });
    },
  },
};

export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Global theme for components",
    defaultValue: "defaultLight",
    toolbar: {
      icon: "mirror",
      items: ["defaultLight", "defaultDark"],
      dynamicTitle: true,
    },
  },
};

const ThemeSwitcher = ({ children, theme }) => {
  const { setTheme } = useTheme();
  React.useEffect(() => {
    setTheme(theme);
  }, [theme]);

  return (
    <Box display="flex" justifyContent="center" __backgroundColor="white">
      {children}
    </Box>
  );
};

export const decorators = [
  (Story, context) => (
    <ThemeProvider defaultTheme={context.globals.theme}>
      <ThemeSwitcher theme={context.globals.theme}>
        <Story />
      </ThemeSwitcher>
    </ThemeProvider>
  ),
];
