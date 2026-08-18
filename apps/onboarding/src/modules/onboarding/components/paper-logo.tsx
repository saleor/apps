"use client";

import { useAppBridge } from "@saleor/app-sdk/app-bridge";

import styles from "./paper-logo.module.css";

/**
 * Logo from saleor/storefront (`public/logo.svg` / `logo-dark.svg`).
 * Reserved brand slot for the Paper storefront card.
 */
export const PaperLogo = ({ className }: { className?: string }) => {
  const { appBridgeState } = useAppBridge();
  const isDark = appBridgeState?.theme === "dark";

  return (
    <span className={`${styles.logoSlot} ${className ?? ""}`} data-test-id="paper-logo">
      {/* Static brand mark from Paper — no optimization needed. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={isDark ? "/paper-logo-dark.svg" : "/paper-logo.svg"}
        alt="Paper"
        width={100}
        height={23}
        className={styles.logoImage}
      />
    </span>
  );
};
