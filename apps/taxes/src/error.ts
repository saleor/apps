import ModernError from "modern-errors";
import modernErrorsSerialize from "modern-errors-serialize";

export type BaseErrorProps = {
  expected?: boolean;
  // severity: "critical" | "warning"; <- will be added with proper Sentry setup
};

export const BaseError = ModernError.subclass("BaseError", {
  props: {} as BaseErrorProps,
  plugins: [modernErrorsSerialize],
});
