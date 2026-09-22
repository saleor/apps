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

  /**
   * The control replaces the title on screen only. A page whose subject is switchable still owes a
   * heading to assistive technology, and losing it would leave the document without an `h1`.
   */
  it("keeps the heading when a control takes the title's place", () => {
    render(
      <AppPageHeader
        title="Order fulfilled"
        titleControl={<button type="button">Switch email</button>}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Order fulfilled" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch email" })).toBeInTheDocument();
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
