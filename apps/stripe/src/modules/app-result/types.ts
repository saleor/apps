import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "./action-required-result";
import { AuthorizationFailureResult, ChargeFailureResult } from "./failure-result";
import { AuthorizationRequestResult, ChargeRequestResult } from "./request-result";
import { AuthorizationSuccessResult, ChargeSuccessResult } from "./success-result";

export type AppResult =
  | ChargeSuccessResult
  | AuthorizationSuccessResult
  | ChargeActionRequiredResult
  | AuthorizationActionRequiredResult
  | ChargeRequestResult
  | AuthorizationRequestResult
  | ChargeFailureResult
  | AuthorizationFailureResult;
