import { SeverityLevel } from "@sentry/nextjs";
import ModernError from "modern-errors";
import modernErrorsSerialize from "modern-errors-serialize";

export type BaseErrorProps = {
  expected?: boolean;
  sentrySeverity: SeverityLevel;
};

export const BaseError = ModernError.subclass("BaseError", {
  props: {} as BaseErrorProps,
  plugins: [modernErrorsSerialize],
});
