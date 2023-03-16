import { describe, expect, it, vi } from "vitest";
import { AppBridgeState } from "@saleor/app-sdk/app-bridge";
import { render, waitFor } from "@testing-library/react";
import { ThemeSynchronizer } from "./theme-synchronizer";

const appBridgeState: AppBridgeState = {
  ready: true,
  token: "token",
  domain: "some-domain.saleor.cloud",
  theme: "dark",
  path: "/",
  locale: "en",
  id: "app-id",
  saleorApiUrl: "https://some-domain.saleor.cloud/graphql/",
};

const mockThemeChange = vi.fn();

vi.mock("@saleor/app-sdk/app-bridge", () => {
  return {
    useAppBridge() {
      return {
        appBridgeState: appBridgeState,
      };
    },
  };
});

vi.mock("@saleor/macaw-ui", () => {
  return {
    useTheme() {
      return {
        setTheme: mockThemeChange,
        themeType: "light",
      };
    },
  };
});

describe("ThemeSynchronizer", () => {
  it("Updates MacawUI theme when AppBridgeState theme changes", () => {
    render(<ThemeSynchronizer />);

    return waitFor(() => {
      expect(mockThemeChange).toHaveBeenCalledWith("dark");
    });
  });
});
