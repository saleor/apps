import { SeverityLevel } from "@sentry/nextjs";
import ModernError from "modern-errors";
import modernErrorsSerialize from "modern-errors-serialize";

export type CommonErrorProps = {
  sentrySeverity: SeverityLevel;
};

export const BaseError = ModernError.subclass("BaseError", {
  props: {} as CommonErrorProps,
  plugins: [modernErrorsSerialize],
});

// Critical errors are reported to Sentry.
export const CriticalError = BaseError.subclass("CriticalError", {
  props: {
    sentrySeverity: "error",
  } as CommonErrorProps,
});

// Expected errors are not reported to Sentry.
export const ExpectedError = BaseError.subclass("ExpectedError", {
  props: {
    sentrySeverity: "warning",
  } as CommonErrorProps,
});
