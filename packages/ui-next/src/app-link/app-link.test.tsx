import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppLink } from "./app-link";

vi.mock("next/router", () => ({
  useRouter: vi.fn(),
}));

const push = vi.fn();

beforeEach(() => {
  vi.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>);
  push.mockClear();
});

describe("AppLink", () => {
  it("Exposes the destination as a real anchor so it hovers and reads as a link", () => {
    render(
      <AppLink href="/configuration/notifications/ORDER_CREATED?language=DE" title="Open it">
        Translated
      </AppLink>,
    );

    const link = screen.getByRole("link", { name: "Translated" });

    expect(link).toHaveAttribute("href", "/configuration/notifications/ORDER_CREATED?language=DE");
    expect(link).toHaveAttribute("title", "Open it");
  });

  /**
   * A document load inside Dashboard's iframe drops the AppBridge params from the frame URL, so
   * the browser must never be allowed to follow the anchor.
   */
  it("Navigates client-side instead of letting the browser follow the anchor", async () => {
    const clicks: MouseEvent[] = [];

    document.addEventListener("click", (event) => clicks.push(event as MouseEvent));

    render(<AppLink href="/configuration">Back</AppLink>);

    await userEvent.click(screen.getByRole("link", { name: "Back" }));

    expect(push).toHaveBeenCalledWith("/configuration");
    expect(clicks.at(0)?.defaultPrevented).toBe(true);
  });
});
