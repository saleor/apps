import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppPageHeader } from "./app-page-header";

vi.mock("next/router", () => ({
  useRouter: vi.fn(),
}));

const push = vi.fn();

beforeEach(() => {
  vi.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>);
  push.mockClear();
});

describe("AppPageHeader", () => {
  it("renders title and actions", () => {
    render(<AppPageHeader title="Configuration" actions={<button type="button">Docs</button>} />);

    expect(screen.getByRole("heading", { level: 1, name: "Configuration" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Docs" })).toBeInTheDocument();
  });

  it("renders back link when href is set", () => {
    render(<AppPageHeader title="New config" href="/config" hrefTitle="Configuration" />);

    const link = screen.getByTestId("app-page-header-back");

    expect(link).toHaveAttribute("href", "/config");
    expect(screen.getByText("Configuration")).toBeInTheDocument();
  });

  /**
   * A document load inside Dashboard's iframe drops the AppBridge params in its URL, which
   * leaves the app unauthenticated - so the anchor must not be followed by the browser.
   */
  it("navigates the back link client-side instead of following the anchor", async () => {
    const clicks: MouseEvent[] = [];

    document.addEventListener("click", (event) => clicks.push(event as MouseEvent));

    render(<AppPageHeader title="New config" href="/config" hrefTitle="Configuration" />);

    await userEvent.click(screen.getByTestId("app-page-header-back"));

    expect(push).toHaveBeenCalledWith("/config");
    expect(clicks.at(0)?.defaultPrevented).toBe(true);
  });
});
