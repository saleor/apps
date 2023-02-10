import {
  dark,
  light,
  SaleorThemeColors,
  ThemeProvider as MacawUIThemeProvider,
} from "@saleor/macaw-ui";
import { PropsWithChildren } from "react";
import { Theme } from "@material-ui/core/styles";

type PalettesOverride = Record<"light" | "dark", SaleorThemeColors>;

/**
 * Temporary override of colors, to match new dashboard palette.
 * Long term this will be replaced with Macaw UI 2.x with up to date design tokens
 */
const palettes: PalettesOverride = {
  light: {
    ...light,
    background: {
      default: "#fff",
      paper: "#fff",
    },
  },
  dark: {
    ...dark,
    background: {
      default: "hsla(211, 42%, 14%, 1)",
      paper: "hsla(211, 42%, 14%, 1)",
    },
  },
};

/**
 * That's a hack required by Macaw-UI incompatibility with React@18
 */
const ThemeProvider = MacawUIThemeProvider as React.FC<
  PropsWithChildren<{ overrides?: Partial<Theme>; ssr: boolean; palettes: PalettesOverride }>
>;

type OuterProps = PropsWithChildren<{ themeOverrides?: Partial<Theme> }>;

/**
 * This is theme provider for old Macaw. Will be removed with Macaw/next
 */
export const MacawThemeProvider = (props: OuterProps) => {
  return <ThemeProvider {...props} ssr palettes={palettes} />;
};
