import { Chip } from "@saleor/macaw-ui";
import { TransactionEventTypeEnum } from "../../generated/graphql";

interface StatusChipProps {
  eventType: TransactionEventTypeEnum | null | undefined;
}

export const StatusChip = ({ eventType }: StatusChipProps) => {
  switch (eventType) {
    case TransactionEventTypeEnum.ChargeRequest:
    case TransactionEventTypeEnum.AuthorizationRequest:
    case TransactionEventTypeEnum.CancelRequest:
    case TransactionEventTypeEnum.RefundRequest:
      return (
        <Chip color="info1" backgroundColor="info1">
          {eventType?.replace(/_/g, " ") ?? "UNKNOWN"}
        </Chip>
      );
    case TransactionEventTypeEnum.ChargeActionRequired:
    case TransactionEventTypeEnum.AuthorizationActionRequired:
      return (
        <Chip color="warning1" backgroundColor="warning1">
          {eventType?.replace(/_/g, " ") ?? "UNKNOWN"}
        </Chip>
      );
    case TransactionEventTypeEnum.ChargeFailure:
    case TransactionEventTypeEnum.AuthorizationFailure:
    case TransactionEventTypeEnum.CancelFailure:
    case TransactionEventTypeEnum.RefundFailure:
      return (
        <Chip color="critical1" backgroundColor="critical1">
          {eventType?.replace(/_/g, " ") ?? "UNKNOWN"}
        </Chip>
      );
    case TransactionEventTypeEnum.ChargeSuccess:
    case TransactionEventTypeEnum.AuthorizationSuccess:
    case TransactionEventTypeEnum.CancelSuccess:
    case TransactionEventTypeEnum.RefundSuccess:
      return (
        <Chip color="success1" backgroundColor="success1">
          {eventType?.replace(/_/g, " ") ?? "UNKNOWN"}
        </Chip>
      );
    // Chargeback, refund reverse, info, authorization adjustment
    default:
      return (
        <Chip color="default1" backgroundColor="default1" whiteSpace="nowrap">
          {eventType?.replace(/_/g, " ") ?? "UNKNOWN"}
        </Chip>
      );
  }
};
