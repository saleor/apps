import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { IconButton } from "./icon-button";

describe("IconButton", () => {
  it("renders an accessible icon control and handles click", async () => {
    const onClick = vi.fn();

    render(<IconButton aria-label="Disconnect channel" icon={<span />} onClick={onClick} />);

    await userEvent.click(screen.getByRole("button", { name: "Disconnect channel" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("forwards the ref to the button, which Dropdown.Trigger needs to open", () => {
    const ref = createRef<HTMLButtonElement>();

    render(<IconButton ref={ref} aria-label="More" icon={<span />} />);

    expect(ref.current).toBe(screen.getByRole("button", { name: "More" }));
  });
});
