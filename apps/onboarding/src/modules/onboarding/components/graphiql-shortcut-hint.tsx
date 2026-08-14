"use client";

import { Box, Text } from "@saleor/macaw-ui";
import { useMemo } from "react";

import styles from "../store-readiness-checklist.module.css";

const getModifierKey = () => {
  if (typeof navigator === "undefined") {
    return "⌘";
  }

  return /Mac|iPhone|iPad/i.test(navigator.userAgent) ? "⌘" : "Ctrl";
};

const InlineKey = ({ children }: { children: string }) => (
  <kbd className={styles.inlineKbd}>{children}</kbd>
);

export const GraphiqlShortcutHint = () => {
  const modifier = useMemo(getModifierKey, []);

  return (
    <Box className={styles.builderItem} data-test-id="store-readiness-graphiql">
      <Box className={styles.builderItemCopy}>
        <Text size={3} fontWeight="medium">
          GraphiQL
        </Text>
        <Text as="p" size={2} color="default2">
          Press{" "}
          <span data-test-id="store-readiness-graphiql-shortcut">
            <InlineKey>{modifier}</InlineKey>
            {" + "}
            <InlineKey>{"'"}</InlineKey>
          </span>{" "}
          to open GraphiQL from anywhere — that’s your playground. On almost every Dashboard page,
          the top-nav menu also has “Open in GraphiQL” for the object you’re viewing.
        </Text>
      </Box>
    </Box>
  );
};
