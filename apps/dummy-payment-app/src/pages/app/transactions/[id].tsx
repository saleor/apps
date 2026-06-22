import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Button, OrdersIcon, Spinner, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";

import { SectionWithDescription } from "@/components/section-with-description";
import { StatusChip } from "@/components/status-chip";
import { TransactionEventReportForm } from "@/components/transaction-event-report-form";
import { useTransactionDetailsViaIdQuery } from "@/generated/graphql";

function formatCurrency(amount: number, currencyCode: string, locale: string = "en-US") {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  });

  return formatter.format(amount);
}

function formatDateTime(dateString: string, locale = "en-US") {
  const date = new Date(dateString);

  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  return formatter.format(date);
}

const EventReporterPage = () => {
  const router = useRouter();
  const { appBridgeState, appBridge } = useAppBridge();

  const transactionId = router.query.id as string;

  const navigateToOrder = (id: string) => {
    appBridge?.dispatch(
      actions.Redirect({
        to: `/orders/${id}`,
        newContext: true,
      }),
    );
  };

  const [{ data }, refetch] = useTransactionDetailsViaIdQuery({
    variables: {
      id: transactionId,
    },
  });

  const transaction = data?.transaction;

  const orderId = transaction?.order?.id;

  return (
    <Box display="grid" gap={8}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={4}>
        <Box>
          <Text as="h1" size={6} fontWeight="bold">
            {transaction?.name.length ? transaction.name : "Transaction"}
          </Text>
          <Text size={3} color="default2" marginTop={1}>
            {transaction?.pspReference ?? transactionId}
          </Text>
        </Box>
        {orderId && (
          <Button variant="secondary" onClick={() => navigateToOrder(orderId)}>
            <OrdersIcon />
            Open order
          </Button>
        )}
      </Box>

      <SectionWithDescription
        title="Event history"
        description={
          <Text size={3} color="default2">
            Events reported for this transaction in Saleor.
          </Text>
        }
      >
        <Box
          display="grid"
          gap={2}
          padding={4}
          borderRadius={4}
          borderStyle="solid"
          borderColor="default1"
          borderWidth={1}
        >
          {data ? (
            transaction?.events.map((event) => (
              <Box
                gap={2}
                key={event.id}
                display="grid"
                __gridTemplateColumns="auto 150px 1fr 200px"
              >
                <Box justifySelf="start">
                  <StatusChip eventType={event.type} />
                </Box>
                <Text justifySelf="end">
                  {formatCurrency(
                    event.amount.amount,
                    event.amount.currency,
                    appBridgeState?.locale,
                  )}
                </Text>
                <Text>{event.message}</Text>
                <Text justifySelf="end">{formatDateTime(event.createdAt)}</Text>
              </Box>
            ))
          ) : (
            <Spinner />
          )}
        </Box>
      </SectionWithDescription>

      <SectionWithDescription
        title="Fire event"
        description={
          <Text size={3} color="default2">
            Manually report a transaction event via Saleor&apos;s{" "}
            <Text size={2} style={{ fontFamily: "monospace" }}>
              transactionEventReport
            </Text>{" "}
            mutation.
          </Text>
        }
      >
        {transaction ? (
          <TransactionEventReportForm
            transaction={transaction}
            onReported={() => refetch({ requestPolicy: "network-only" })}
          />
        ) : (
          <Spinner />
        )}
      </SectionWithDescription>
    </Box>
  );
};

export default EventReporterPage;
