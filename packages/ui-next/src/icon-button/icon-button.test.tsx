import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { IconButton } from "./icon-button";

describe("IconButton", () => {
  it("renders an accessible icon control and handles click", async () => {
    const onClick = vi.fn();

    render(<IconButton aria-label="Disconnect channel" icon={<span />} onClick={onClick} />);

    await userEvent.click(screen.getByRole("button", { name: "Disconnect channel" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
