import { Box, Button, Combobox, Input, Spinner, Text, Toggle } from "@saleor/macaw-ui";
import React from "react";

import { TransactionEventTypeEnum, type TransactionFragment } from "@/generated/graphql";
import { TransactionPspFinder } from "@/modules/transaction/transaction-psp-finder";
import { trpcClient } from "@/trpc-client";

interface EventReporterOption {
  label: TransactionEventTypeEnum;
  value: TransactionEventTypeEnum;
}

interface TransactionEventReportFormProps {
  transaction: Pick<TransactionFragment, "id" | "events" | "chargedAmount">;
  /** Pre-filled amount value (e.g. order total). Defaults to empty. */
  defaultAmount?: string;
  /** Currency shown next to the amount input. Falls back to the transaction's charged amount currency. */
  currency?: string;
  /** Called after an event was successfully reported, e.g. to refetch data. */
  onReported?: () => void;
}

/**
 * Shared form for reporting a single transaction event via Saleor's
 * `transactionEventReport` mutation. Used both by the full-page transaction
 * details view and the order-details widget.
 */
export const TransactionEventReportForm = ({
  transaction,
  defaultAmount = "",
  currency,
  onReported,
}: TransactionEventReportFormProps) => {
  const [eventType, setEventType] = React.useState<EventReporterOption>({
    label: TransactionEventTypeEnum.ChargeSuccess,
    value: TransactionEventTypeEnum.ChargeSuccess,
  });
  const [amount, setAmount] = React.useState(defaultAmount);
  const [sendNullAmount, setSendNullAmount] = React.useState(false);
  const [generateNewPspReference, setGenerateNewPspReference] = React.useState(false);
  const [otherError, setOtherError] = React.useState<string | null>(null);

  const mutation = trpcClient.transactionReporter.reportEvent.useMutation();
  const isLoading = mutation.isLoading;

  const handleReportEvent = async () => {
    setOtherError(null);
    const pspFinder = new TransactionPspFinder();

    try {
      const parsedAmount = sendNullAmount ? null : parseFloat(amount);

      if (!sendNullAmount && Number.isNaN(parsedAmount as number)) {
        setOtherError("Invalid amount");

        return;
      }

      let pspReference: string | undefined;

      if (!generateNewPspReference) {
        pspReference = pspFinder.findLastPspReference(transaction) || undefined;

        if (!pspReference) {
          setOtherError("No pspReference found in transaction, change setting to generate new one");

          return;
        }
      }

      await mutation.mutateAsync({
        id: transaction.id,
        amount: parsedAmount,
        type: eventType.value,
        pspReference,
      });

      onReported?.();
    } catch (error) {
      setOtherError(error instanceof Error ? error.message : "Failed to report transaction event");
    }
  };

  return (
    <Box display="grid" gap={4}>
      <Box display="flex" alignItems="center" gap={2}>
        <Text size={3}>Event type</Text>
        <Combobox
          options={Object.values(TransactionEventTypeEnum).map((value) => ({
            label: value,
            value,
          }))}
          value={eventType}
          onChange={(val) => setEventType(val as EventReporterOption)}
          size="small"
          __width="220px"
        />
      </Box>
      <Box display="flex" alignItems="center" gap={2}>
        <Text size={3}>Amount</Text>
        <Input
          type="number"
          value={sendNullAmount ? "" : amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={sendNullAmount}
          __opacity={sendNullAmount ? "0.4" : "1"}
          endAdornment={<Text size={1}>{currency ?? transaction.chargedAmount.currency}</Text>}
        />
        <Toggle pressed={sendNullAmount} onPressedChange={(pressed) => setSendNullAmount(pressed)}>
          <Text>null</Text>
        </Toggle>
      </Box>
      <Toggle
        pressed={generateNewPspReference}
        onPressedChange={(pressed) => setGenerateNewPspReference(pressed)}
      >
        <Text>Generate new pspReference</Text>
      </Toggle>
      <Button
        disabled={isLoading}
        onClick={handleReportEvent}
        variant={otherError || mutation.error ? "error" : "primary"}
      >
        {isLoading && <Spinner />}Fire event
      </Button>
      {mutation.data && (
        <Text color="success1">
          Transaction reported: <pre>{JSON.stringify(mutation.data, null, 2)}</pre>
        </Text>
      )}
      {mutation.error && (
        <Box display="flex" alignItems="center" gap={2} flexDirection="column">
          <Text color="critical1" size={4} fontWeight="medium">
            Error returned when reporting event:
          </Text>
          <Text>{mutation.error.message}</Text>
        </Box>
      )}
      {otherError && <Text color="critical1">{otherError}</Text>}
    </Box>
  );
};
