"use client";

import { Box } from "@saleor/macaw-ui";

const Check = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M5 9.5L7.5 12L13 6.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Circle = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export function StepIcon({ isComplete }: { isComplete: boolean }) {
  return (
    <Box
      color={isComplete ? "accent1" : "default1"}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
    >
      {isComplete ? Check : Circle}
    </Box>
  );
}
