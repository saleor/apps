import { TransactionEventTypeEnum } from "../../generated/graphql";

export type TransactionEventType = `${TransactionEventTypeEnum}`;

export function getTransactionActions(
  type: TransactionEventType
): Array<"REFUND" | "CHARGE" | "CANCEL"> {
  switch (type) {
    case TransactionEventTypeEnum.Info:
    case TransactionEventTypeEnum.ChargeBack:
    case TransactionEventTypeEnum.ChargeFailure:
      return ["REFUND", "CHARGE", "CANCEL"];
    case TransactionEventTypeEnum.AuthorizationAdjustment:
    case TransactionEventTypeEnum.AuthorizationFailure:
    case TransactionEventTypeEnum.AuthorizationRequest:
    case TransactionEventTypeEnum.AuthorizationSuccess:
    case TransactionEventTypeEnum.CancelFailure:
    case TransactionEventTypeEnum.CancelRequest:
      return ["CHARGE", "CANCEL"];
    case TransactionEventTypeEnum.ChargeRequest:
    case TransactionEventTypeEnum.ChargeSuccess:
    case TransactionEventTypeEnum.RefundFailure:
    case TransactionEventTypeEnum.RefundRequest:
    case TransactionEventTypeEnum.RefundSuccess:
      return ["REFUND"];
    case TransactionEventTypeEnum.CancelSuccess:
    case TransactionEventTypeEnum.ChargeActionRequired:
    case TransactionEventTypeEnum.AuthorizationActionRequired:
    case TransactionEventTypeEnum.RefundReverse:
      return [];
    default:
      return [];
  }
}
