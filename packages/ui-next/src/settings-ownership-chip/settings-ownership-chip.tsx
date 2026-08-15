import { Box, Text } from "@saleor/macaw-ui";
import { Globe, Store } from "lucide-react";

import styles from "./settings-ownership-chip.module.css";

export type SettingsOwnership = "shop" | "channel";

interface SettingsOwnershipChipProps {
  ownership: SettingsOwnership;
  /** Override default Shop / Channel labels (caller owns localization). */
  label?: string;
}

/**
 * Ownership pill for SettingsSection / settings cards.
 * Shop (store-wide) vs Channel (per-channel) — same chrome as Dashboard.
 */
export const SettingsOwnershipChip = ({
  ownership,
  label,
}: SettingsOwnershipChipProps): JSX.Element => {
  const Icon = ownership === "shop" ? Store : Globe;
  const isShop = ownership === "shop";
  const resolvedLabel = label ?? (isShop ? "Shop" : "Channel");

  return (
    <Box
      as="span"
      className={styles.chip}
      data-test-id={`settings-ownership-${ownership}`}
      backgroundColor={isShop ? "accent1Pressed" : "default2"}
      borderColor={isShop ? "accent1" : "default1"}
      borderWidth={1}
      borderStyle="solid"
      borderRadius={2}
      color="default1"
    >
      <Icon className={styles.chipIcon} size={12} strokeWidth={2} aria-hidden />
      <Text size={1} fontWeight="medium" color="default1">
        {resolvedLabel}
      </Text>
    </Box>
  );
};

SettingsOwnershipChip.displayName = "SettingsOwnershipChip";
