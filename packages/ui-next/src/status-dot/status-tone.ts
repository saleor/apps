/**
 * Shared severity for status dots and Dashboard-style pills.
 *
 * Matches Dashboard `DotStatus` / `PillStatusType` where they overlap. `info` is the extra tone
 * macaw exposes for in-flight work — Building, Updating — which Dashboard's status dot does not
 * have.
 */
export type StatusTone = "success" | "info" | "warning" | "error" | "neutral";
