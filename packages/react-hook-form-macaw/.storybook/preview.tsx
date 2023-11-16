import "@saleor/macaw-ui/style";
import "./styles.css";

import React from "react";
import { Preview } from "@storybook/react";
import { Box, DefaultTheme, ThemeProvider, useTheme } from "@saleor/macaw-ui";

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

const themes: DefaultTheme[] = ["defaultLight", "defaultDark"];

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: themes[0],
      toolbar: {
        icon: "mirror",
        items: themes,
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <ThemeProvider defaultTheme={context.globals.theme}>
        <ThemeSwitcher theme={context.globals.theme}>
          <Story />
        </ThemeSwitcher>
      </ThemeProvider>
    ),
  ],
};

export default preview;
