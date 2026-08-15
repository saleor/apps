import { Button } from "@saleor/macaw-ui";
import { isValidElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";

import {
  coerceHeaderEndActions,
  DETAIL_SETTINGS_CARD_HEADER_ACTION_SIZE,
} from "./coerce-header-end-actions";

describe("coerceHeaderEndActions", () => {
  it("sets macaw Button size to small when omitted", () => {
    const input = <Button variant="secondary">Assign</Button>;

    const result = coerceHeaderEndActions(input) as ReactElement<{ size?: string }>;

    expect(isValidElement(result)).toBe(true);
    expect(result.props.size).toBe(DETAIL_SETTINGS_CARD_HEADER_ACTION_SIZE);
  });

  it("does not override an explicit Button size", () => {
    const input = (
      <Button variant="secondary" size="medium">
        Assign
      </Button>
    );

    const result = coerceHeaderEndActions(input) as ReactElement<{ size?: string }>;

    expect(result.props.size).toBe("medium");
  });

  it("sets Button size through a layout wrapper", () => {
    const input = (
      <div>
        <Button variant="secondary">Assign</Button>
      </div>
    );

    const result = coerceHeaderEndActions(input) as ReactElement<{ children?: unknown }>;
    const child = result.props.children as ReactElement<{ size?: string }>;

    expect(child.props.size).toBe(DETAIL_SETTINGS_CARD_HEADER_ACTION_SIZE);
  });
});
