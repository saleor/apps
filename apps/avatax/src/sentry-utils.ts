import { SeverityLevel } from "@sentry/nextjs";
import { z } from "zod";

/*
 * // todo: move to shared
 * // todo: add typed env using @t3-oss/env-nextjs
 */
const sentryReportLevel = z
  .string()
  .min(1, "NEXT_PUBLIC_SENTRY_REPORT_LEVEL must be at least 1 character long")
  .parse(process.env.NEXT_PUBLIC_SENTRY_REPORT_LEVEL);

const sortedSeverities = ["fatal", "error", "warning", "log", "info", "debug"];
const reportThresholdLevelIndex = sortedSeverities.indexOf(sentryReportLevel);

/** Checks whether the provided sentrySeverity should be logged to Sentry */
export const shouldExceptionLevelBeReported = (level: SeverityLevel) => {
  const levelIndex = sortedSeverities.indexOf(level);

  return levelIndex <= reportThresholdLevelIndex;
};
