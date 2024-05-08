import { CommonErrorProps, CriticalError, ExpectedError } from "../../../error";

export const OrderCancelPayloadOrderError = CriticalError.subclass("OrderCancelPayloadError", {
  props: {
    expected: false,
    sentrySeverity: "error",
  } as CommonErrorProps,
});

export const OrderCancelNoAvataxIdError = ExpectedError.subclass("OrderCancelNoAvataxIdError");
