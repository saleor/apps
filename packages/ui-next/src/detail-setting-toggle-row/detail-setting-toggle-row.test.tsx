import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DetailSettingToggleRow } from "./detail-setting-toggle-row";

const renderRow = (props: Partial<Parameters<typeof DetailSettingToggleRow>[0]> = {}) => {
  const onPressedChange = vi.fn();

  render(
    <DetailSettingToggleRow
      title="Allow unpaid orders"
      description="Lets checkout complete before payment succeeds."
      pressed={false}
      onPressedChange={onPressedChange}
      testId="row"
      {...props}
    />,
  );

  return { onPressedChange };
};

describe("DetailSettingToggleRow", () => {
  it("renders the title and description", () => {
    renderRow();

    expect(screen.getByText("Allow unpaid orders")).toBeInTheDocument();
    expect(screen.getByText("Lets checkout complete before payment succeeds.")).toBeInTheDocument();
  });

  /* The whole copy block is the control, so the row is one target rather than a toggle to aim at. */
  it("toggles when the copy is clicked", async () => {
    const { onPressedChange } = renderRow();

    await userEvent.click(screen.getByRole("button", { name: /Allow unpaid orders/ }));

    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle while disabled", async () => {
    const { onPressedChange } = renderRow({ disabled: true });

    await userEvent.click(screen.getByRole("button", { name: /Allow unpaid orders/ }));

    expect(onPressedChange).not.toHaveBeenCalled();
  });
});
