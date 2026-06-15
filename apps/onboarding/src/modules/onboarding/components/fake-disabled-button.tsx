"use client";

import { Button, type ButtonProps, vars } from "@saleor/macaw-ui";
import { forwardRef, useState } from "react";

export const FakeDisabledButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Button
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        cursor="not-allowed"
        variant="primary"
        boxShadow="none"
        aria-disabled
        // Keep keyboard-focusable so keyboard users can reach the tooltip explaining why it's disabled
        tabIndex={0}
        // Inline styles override macaw-ui's later-applied background classes
        style={{
          backgroundColor: isHovered
            ? vars.colors.background.buttonDefaultPrimaryHovered
            : vars.colors.background.buttonDefaultDisabled,
          color: vars.colors.text.defaultDisabled,
        }}
        {...props}
      >
        {children}
      </Button>
    );
  },
);

FakeDisabledButton.displayName = "FakeDisabledButton";
