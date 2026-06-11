import { Box, Button, Combobox, Input, OrdersIcon, Spinner, Text, Toggle } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import { StatusChip } from "@/components/StatusChip";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import React, { useState } from "react";
import { trpcClient } from "@/trpc-client";
import { TransactionEventTypeEnum, useTransactionDetailsViaIdQuery } from "@/generated/graphql";
import { TransactionPspFinder } from "@/modules/transaction/transaction-psp-finder";

interface EventReporterOptions {
  label: TransactionEventTypeEnum;
  value: TransactionEventTypeEnum;
}

function formatCurrency(amount: number, currencyCode: string, locale: string = "en-US") {
  // Create a formatter
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  });

  // Format the number
  return formatter.format(amount);
}

function formatDateTime(dateString: string, locale = "en-US") {
  // Parse the date string to a Date object
  const date = new Date(dateString);

  // Create a formatter
  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false, // Use 24-hour format
  });

  // Format the date
  return formatter.format(date);
}

const EventReporterPage = () => {
  const router = useRouter();
  const { appBridgeState, appBridge } = useAppBridge();
  const [otherError, setOtherError] = React.useState<string | null>(null);

  const transactionId = router.query.id as string;

  const [eventType, setEventType] = React.useState<EventReporterOptions>({
    label: TransactionEventTypeEnum.ChargeSuccess,
    value: TransactionEventTypeEnum.ChargeSuccess,
  });

  const [amount, setAmount] = React.useState("");

  const [generateNewPspReference, setGenerateNewPspReference] = useState<boolean>(false);
  const [sendNullAmount, setSendNullAmount] = useState<boolean>(false);

  const navigateToOrder = (id: string) => {
    appBridge?.dispatch(
      actions.Redirect({
        to: `/orders/${id}`,
        newContext: true,
      })
    );
  };

  const [{ data, fetching }, refetch] = useTransactionDetailsViaIdQuery({
    variables: {
      id: transactionId,
    },
  });

  const transaction = data?.transaction;

  const orderId = transaction?.order?.id;

  const mutation = trpcClient.transactionReporter.reportEvent.useMutation();

  const isLoading = fetching || mutation.isLoading;

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
        if (!data?.transaction) {
          setOtherError("No transaction found to find lastPspRefernce");
          return;
        }

        pspReference = pspFinder.findLastPspReference(data.transaction) || undefined;

        if (!pspReference) {
          setOtherError("No pspReference found in transaction, change setting to generate new one");
          return;
        }

        console.log(pspReference);
      }

      await mutation.mutateAsync({
        id: transaction?.id ?? "",
        amount: parsedAmount,
        type: eventType.value,
        pspReference,
      });
      refetch({ requestPolicy: "network-only" });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      width="100%"
      alignItems="center"
      gap={4}
    >
      <Text size={7}>Transaction event reporter</Text>
      <Box
        display="grid"
        gap={2}
        padding={4}
        borderRadius={4}
        borderStyle="solid"
        borderColor="default1"
        boxShadow="defaultFocused"
      >
        {data ? (
          <>
            <Box display="flex" justifyContent="space-between">
              <Text size={6}>{transaction?.name.length ? transaction.name : "Transaction"}</Text>
              <Button variant="secondary" onClick={() => navigateToOrder(orderId ?? "")}>
                <OrdersIcon />
                Open order
              </Button>
            </Box>
            <Text color="default2" marginBottom={4}>
              {transaction?.pspReference}
            </Text>
            {transaction?.events.map((event) => (
              <Box
                gap={2}
                key={event.id}
                display="grid"
                __gridTemplateColumns="auto 150px 150px 200px"
              >
                <Box justifySelf="start">
                  <StatusChip eventType={event.type} />
                </Box>
                <Text justifySelf="end">
                  {formatCurrency(
                    event.amount.amount,
                    event.amount.currency,
                    appBridgeState?.locale
                  )}
                </Text>
                <Text>{event.message}</Text>
                <Text justifySelf="end">{formatDateTime(event.createdAt)}</Text>
              </Box>
            ))}
          </>
        ) : (
          <Spinner />
        )}
      </Box>
      <Box display="flex" alignItems="center" gap={2}>
        <Text>Selet event type:</Text>
        <Combobox
          options={Object.values(TransactionEventTypeEnum).map((eventType) => ({
            label: eventType,
            value: eventType,
          }))}
          value={eventType}
          onChange={(val) => setEventType(val as EventReporterOptions)}
          size="small"
          __width="220px"
        />
      </Box>
      <Box display="flex" alignItems="center" gap={2}>
        <Text>Enter event amount:</Text>
        <Input
          type="number"
          value={sendNullAmount ? "" : amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={sendNullAmount}
          __opacity={sendNullAmount ? "0.4" : "1"}
          endAdornment={<Text size={1}>{transaction?.chargedAmount.currency}</Text>}
        />
        <Toggle
          pressed={sendNullAmount}
          onPressedChange={(pressed) => setSendNullAmount(pressed)}
        >
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
        {isLoading && <Spinner />}Fire event!
      </Button>
      {mutation.data && (
        <Text color="success1">
          Transaction reported: <pre>{JSON.stringify(mutation.data, null, 2)}</pre>
        </Text>
      )}
      {mutation.error && (
        <Box display="flex" alignItems="center" gap={2} flexDirection="column" paddingX={12}>
          <Text color="critical1" size={5} fontWeight="medium">
            Error returned when reporting event:
          </Text>
          <Text>{mutation.error.message}</Text>
        </Box>
      )}
      {otherError && <Text color="critical1">{otherError}</Text>}
    </Box>
  );
};

export default EventReporterPage;
