import { Text } from "@saleor/macaw-ui";

import styles from "./key-prefix.module.css";

type Props = {
  children: string;
  size?: 1 | 2;
};

/**
 * Inline monospace Stripe key prefix (`pk_test`, `rk_live`) for body copy and field hints.
 * Reading these character by character is the point, so they never share the prose font.
 *
 * Color goes through the `__color` escape hatch on purpose: these sit inside muted `default2`
 * copy, and macaw's own wrapper (field helper text) emits a color class of equal specificity,
 * so a nested `color` prop would win or lose on stylesheet order alone.
 */
export const KeyPrefix = ({ children, size = 1 }: Props) => (
  <Text as="span" size={size} __color="var(--mu-colors-text-default1)" className={styles.prefix}>
    {children}
  </Text>
);
