import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardModal } from "./dashboard-modal";
import styles from "./dashboard-modal.module.css";

describe("DashboardModal", () => {
  it("applies header-only layout for confirmation dialogs", () => {
    render(
      <DashboardModal open onChange={() => undefined}>
        <DashboardModal.Content size="sm">
          <DashboardModal.Header>Leave without saving changes?</DashboardModal.Header>
          <DashboardModal.Actions>
            <button type="button">Keep editing</button>
          </DashboardModal.Actions>
        </DashboardModal.Content>
      </DashboardModal>,
    );

    expect(document.querySelector(`.${styles.contentShellHeaderOnly}`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep editing" })).toBeInTheDocument();
  });

  it("keeps the header divider on form dialogs with a body", () => {
    render(
      <DashboardModal open onChange={() => undefined}>
        <DashboardModal.Content size="xs">
          <DashboardModal.Header>Enter voucher code</DashboardModal.Header>
          <DashboardModal.Body>
            <DashboardModal.Inset>
              <input data-test-id="form-input" />
            </DashboardModal.Inset>
          </DashboardModal.Body>
          <DashboardModal.Actions>
            <button type="button">Confirm</button>
          </DashboardModal.Actions>
        </DashboardModal.Content>
      </DashboardModal>,
    );

    expect(document.querySelector(`.${styles.fullBleedDivider}`)).toBeInTheDocument();
    expect(document.querySelector(`.${styles.contentShellHeaderOnly}`)).not.toBeInTheDocument();
    expect(screen.getByTestId("form-input")).toBeInTheDocument();
  });
});
