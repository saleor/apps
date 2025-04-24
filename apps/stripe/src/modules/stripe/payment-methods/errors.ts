import { BaseError } from "@/lib/errors";

export const PaymentMethodError = BaseError.subclass("PaymentMethodError", {
  props: {
    _internalName: "PaymentMethodError" as const,
  },
});

export type PaymentMethodErrorType = InstanceType<typeof PaymentMethodError>;
