import { BaseError } from "@/lib/errors";

export type StripePaymentIntentsApiErrorTypes =
  | InstanceType<typeof UnknownPaymentIntentError>
  | InstanceType<typeof InvalidRequestError>
  | InstanceType<typeof PaymentMethodDelayedCaptureNotSupportedError>;

export const UnknownPaymentIntentError = BaseError.subclass("UnknownPaymentIntentError", {
  props: {
    _internalName: "CreatePaymentIntentError" as const,
  },
});

export const InvalidRequestError = BaseError.subclass("InvalidRequestError", {
  props: {
    _internalName: "InvalidRequestError" as const,
  },
});

export const PaymentMethodDelayedCaptureNotSupportedError = InvalidRequestError.subclass(
  "PaymentMethodDelayedCaptureNotSupportedError",
  {
    props: {
      _internalName: "PaymentMethodDelayedCaptureNotSupported" as const,
    },
  },
);
