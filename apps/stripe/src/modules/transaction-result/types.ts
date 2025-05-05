import { StripeEnv } from "@/modules/stripe/stripe-env";

import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "./action-required-result";
import { CancelSuccessResult } from "./cancel-result";
import { AuthorizationFailureResult, ChargeFailureResult } from "./failure-result";
import { AuthorizationRequestResult, ChargeRequestResult } from "./request-result";
import { AuthorizationSuccessResult, ChargeSuccessResult } from "./success-result";

export type TransactionResult =
  | ChargeSuccessResult
  | AuthorizationSuccessResult
  | ChargeActionRequiredResult
  | AuthorizationActionRequiredResult
  | ChargeRequestResult
  | AuthorizationRequestResult
  | ChargeFailureResult
  | AuthorizationFailureResult
  | CancelSuccessResult;

export abstract class ResultBase {
  readonly stripeEnv: StripeEnv;

  constructor(stripeEnv: StripeEnv) {
    this.stripeEnv = stripeEnv;
  }
}
