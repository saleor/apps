import { actions, useAppBridge, useWidgetAutoResize } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Combobox, Input, Spinner, Text, Toggle } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import React from "react";
import { v7 as uuidv7 } from "uuid";

import { TransactionEventReportForm } from "@/components/transaction-event-report-form";
import { TransactionEventTypeEnum, useOrderDetailsQuery } from "@/generated/graphql";
import {
  DEFAULT_CARD_PAYMENT_METHOD,
  DEFAULT_TRANSACTION_MESSAGE,
  DEFAULT_TRANSACTION_NAME,
} from "@/modules/transaction/transaction-defaults";
import { type PaymentMethodDetailsInputShape } from "@/modules/validation/transaction-create";
import { trpcClient } from "@/trpc-client";

/**
 * Quick-action recipes: each creates a fresh transaction with the default card
 * payment method and immediately reports a single typed event for the order's
 * full gross total. Extend this array to add more presets.
 */
const QUICK_ACTIONS: Array<{ id: string; label: string; eventType: TransactionEventTypeEnum }> = [
  {
    id: "charge-full-total",
    label: "Charge full total",
    eventType: TransactionEventTypeEnum.ChargeSuccess,
  },
  {
    id: "authorize-full-total",
    label: "Authorize full total",
    eventType: TransactionEventTypeEnum.AuthorizationSuccess,
  },
];

type PaymentMethodType = "card" | "giftCard" | "other";

interface ComboboxOption<T extends string = string> {
  label: string;
  value: T;
}

/**
 * Gift card payment method details require Saleor 3.23+. Returns false when the
 * version cannot be determined, so we never send a field a 3.22 backend rejects.
 */
function isSaleorAtLeast323(version?: string): boolean {
  if (!version) {
    return false;
  }

  const [major, minor] = version.split(".").map((part) => parseInt(part, 10));

  if (Number.isNaN(major) || Number.isNaN(minor)) {
    return false;
  }

  return major > 3 || (major === 3 && minor >= 23);
}

const WidgetCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box
    display="grid"
    gap={4}
    padding={4}
    borderRadius={4}
    borderStyle="solid"
    borderColor="default1"
    borderWidth={1}
  >
    <Text size={4} fontWeight="bold">
      {title}
    </Text>
    {children}
  </Box>
);

const OrderDetailsWidget = () => {
  const router = useRouter();
  const { appBridge, appBridgeState } = useAppBridge();
  const rootRef = React.useRef<HTMLDivElement>(null);

  useWidgetAutoResize(rootRef);

  const orderId = router.query.orderId as string | undefined;

  const giftCardEnabled = isSaleorAtLeast323(appBridgeState?.saleorVersion);

  const [{ data, fetching, error }, refetch] = useOrderDetailsQuery({
    variables: { id: orderId ?? "" },
    pause: !orderId,
  });

  const order = data?.order;
  const totalAmount = order?.total.gross.amount;
  const currency = order?.total.gross.currency;
  const transactions = React.useMemo(() => order?.transactions ?? [], [order]);

  const createMutation = trpcClient.transactionReporter.createTransaction.useMutation();

  // --- Feedback helpers ---------------------------------------------------
  const notify = (status: "success" | "error", title: string, text?: string) =>
    appBridge?.dispatch(actions.Notification({ status, title, text }));

  const onSuccess = (title: string) => {
    notify("success", title);
    refetch({ requestPolicy: "network-only" });
    /*
     * Ask the Dashboard to refresh the order it currently has open so the
     * transaction we just created/updated shows up without a manual reload.
     */
    appBridge?.dispatch(actions.RefreshEntity());
  };

  const onError = (e: unknown) =>
    notify("error", "Operation failed", e instanceof Error ? e.message : String(e));

  // --- Precise create form state -----------------------------------------
  const [createOpen, setCreateOpen] = React.useState(false);
  const [name, setName] = React.useState(DEFAULT_TRANSACTION_NAME);
  const [message, setMessage] = React.useState(DEFAULT_TRANSACTION_MESSAGE);
  const [pspReference, setPspReference] = React.useState(() => uuidv7());

  const paymentMethodOptions: ComboboxOption<PaymentMethodType>[] = [
    { label: "Credit card", value: "card" },
    ...(giftCardEnabled ? [{ label: "Gift card", value: "giftCard" as const }] : []),
    { label: "Other", value: "other" },
  ];
  const [paymentMethodType, setPaymentMethodType] = React.useState<
    ComboboxOption<PaymentMethodType>
  >({ label: "Credit card", value: "card" });

  const [pmName, setPmName] = React.useState(DEFAULT_CARD_PAYMENT_METHOD.name);
  const [cardBrand, setCardBrand] = React.useState(DEFAULT_CARD_PAYMENT_METHOD.brand ?? "");
  const [cardLastDigits, setCardLastDigits] = React.useState(
    DEFAULT_CARD_PAYMENT_METHOD.lastDigits ?? "",
  );
  const [cardExpMonth, setCardExpMonth] = React.useState(
    String(DEFAULT_CARD_PAYMENT_METHOD.expMonth ?? ""),
  );
  const [cardExpYear, setCardExpYear] = React.useState(
    String(DEFAULT_CARD_PAYMENT_METHOD.expYear ?? ""),
  );
  const [giftCardLastChars, setGiftCardLastChars] = React.useState("");

  const buildPaymentMethodDetails = (): PaymentMethodDetailsInputShape => {
    if (paymentMethodType.value === "card") {
      return {
        card: {
          name: pmName,
          ...(cardBrand ? { brand: cardBrand } : {}),
          ...(cardLastDigits ? { lastDigits: cardLastDigits } : {}),
          ...(cardExpMonth ? { expMonth: Number(cardExpMonth) } : {}),
          ...(cardExpYear ? { expYear: Number(cardExpYear) } : {}),
        },
      };
    }

    if (paymentMethodType.value === "giftCard") {
      return {
        giftCard: {
          name: pmName,
          ...(cardBrand ? { brand: cardBrand } : {}),
          ...(giftCardLastChars ? { lastChars: giftCardLastChars } : {}),
        },
      };
    }

    return { other: { name: pmName } };
  };

  const handleQuickAction = async (action: (typeof QUICK_ACTIONS)[number]) => {
    if (!orderId || totalAmount == null) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        orderId,
        paymentMethodDetails: { card: DEFAULT_CARD_PAYMENT_METHOD },
        initialEvent: { type: action.eventType, amount: totalAmount },
      });
      onSuccess(`${action.label} — transaction created`);
    } catch (e) {
      onError(e);
    }
  };

  const handleCreate = async () => {
    if (!orderId) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        orderId,
        name,
        message,
        pspReference,
        paymentMethodDetails: buildPaymentMethodDetails(),
      });
      onSuccess("Transaction created");
      setPspReference(uuidv7());
    } catch (e) {
      onError(e);
    }
  };

  // --- Existing transaction selection ------------------------------------
  const transactionOptions: ComboboxOption[] = transactions.map((t) => {
    const lastEvent = t.events[t.events.length - 1]?.type;
    const shortPsp = t.pspReference ? ` · ${t.pspReference.slice(0, 8)}` : "";

    return {
      label: `${t.name || "Transaction"}${shortPsp}${lastEvent ? ` · ${lastEvent}` : ""}`,
      value: t.id,
    };
  });
  const [selectedTransactionId, setSelectedTransactionId] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (transactions.length === 0) {
      setSelectedTransactionId(undefined);

      return;
    }
    setSelectedTransactionId((current) =>
      current && transactions.some((t) => t.id === current) ? current : transactions[0].id,
    );
  }, [transactions]);

  const selectedTransaction = transactions.find((t) => t.id === selectedTransactionId);
  const selectedTransactionOption =
    transactionOptions.find((o) => o.value === selectedTransactionId) ?? null;

  // --- Render -------------------------------------------------------------
  if (!orderId) {
    return (
      <Box ref={rootRef}>
        <Text color="critical1">Open this widget from an order&apos;s detail page.</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box ref={rootRef}>
        <Text color="critical1">Failed to load order: {error.message}</Text>
      </Box>
    );
  }

  if (fetching && !order) {
    return (
      <Box ref={rootRef} display="flex" justifyContent="center" padding={4}>
        <Spinner />
      </Box>
    );
  }

  const amountLabel =
    totalAmount != null && currency ? `${totalAmount} ${currency}` : "order total";
  const isBusy = createMutation.isLoading;

  return (
    <Box ref={rootRef} display="grid" gap={4}>
      {/* Quick actions */}
      <WidgetCard title="Quick actions">
        <Text size={2} color="default2">
          Create a transaction and report an event for the full order total ({amountLabel}).
        </Text>
        <Box display="flex" gap={2} flexWrap="wrap">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.id}
              variant="primary"
              disabled={isBusy || totalAmount == null}
              onClick={() => handleQuickAction(action)}
            >
              {isBusy && <Spinner />}
              {action.label}
            </Button>
          ))}
        </Box>
      </WidgetCard>

      {/* Precise create */}
      <WidgetCard title="Create custom transaction">
        <Toggle pressed={createOpen} onPressedChange={setCreateOpen}>
          <Text>{createOpen ? "Hide" : "Show"} form</Text>
        </Toggle>

        {createOpen && (
          <Box display="grid" gap={3}>
            <Box display="grid" gap={1}>
              <Text size={2}>Name</Text>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Box>

            <Box display="grid" gap={1}>
              <Text size={2}>Message</Text>
              <Input value={message} onChange={(e) => setMessage(e.target.value)} />
            </Box>

            <Box display="grid" gap={1}>
              <Text size={2}>PSP reference</Text>
              <Box display="flex" gap={2} alignItems="center">
                <Input
                  value={pspReference}
                  onChange={(e) => setPspReference(e.target.value)}
                  __flex="1"
                />
                <Button variant="secondary" onClick={() => setPspReference(uuidv7())}>
                  Regenerate
                </Button>
              </Box>
            </Box>

            <Box display="grid" gap={1}>
              <Text size={2}>Payment method</Text>
              <Combobox
                options={paymentMethodOptions}
                value={paymentMethodType}
                onChange={(val) => setPaymentMethodType(val as ComboboxOption<PaymentMethodType>)}
                size="small"
              />
              {!giftCardEnabled && (
                <Text size={1} color="default2">
                  Gift card requires Saleor 3.23+
                </Text>
              )}
            </Box>

            <Box display="grid" gap={1}>
              <Text size={2}>Payment method name</Text>
              <Input value={pmName} onChange={(e) => setPmName(e.target.value)} />
            </Box>

            {paymentMethodType.value === "card" && (
              <>
                <Box display="grid" gap={1}>
                  <Text size={2}>Brand</Text>
                  <Input value={cardBrand} onChange={(e) => setCardBrand(e.target.value)} />
                </Box>
                <Box display="grid" gap={1}>
                  <Text size={2}>Last digits</Text>
                  <Input
                    value={cardLastDigits}
                    onChange={(e) => setCardLastDigits(e.target.value)}
                  />
                </Box>
                <Box display="flex" gap={2}>
                  <Box display="grid" gap={1} __flex="1">
                    <Text size={2}>Exp. month</Text>
                    <Input
                      type="number"
                      value={cardExpMonth}
                      onChange={(e) => setCardExpMonth(e.target.value)}
                    />
                  </Box>
                  <Box display="grid" gap={1} __flex="1">
                    <Text size={2}>Exp. year</Text>
                    <Input
                      type="number"
                      value={cardExpYear}
                      onChange={(e) => setCardExpYear(e.target.value)}
                    />
                  </Box>
                </Box>
              </>
            )}

            {paymentMethodType.value === "giftCard" && (
              <>
                <Box display="grid" gap={1}>
                  <Text size={2}>Brand</Text>
                  <Input value={cardBrand} onChange={(e) => setCardBrand(e.target.value)} />
                </Box>
                <Box display="grid" gap={1}>
                  <Text size={2}>Last characters</Text>
                  <Input
                    value={giftCardLastChars}
                    onChange={(e) => setGiftCardLastChars(e.target.value)}
                  />
                </Box>
              </>
            )}

            <Button variant="primary" disabled={isBusy} onClick={handleCreate}>
              {isBusy && <Spinner />}Create transaction
            </Button>
          </Box>
        )}
      </WidgetCard>

      {/* Existing transactions */}
      <WidgetCard title="Report event to existing transaction">
        {transactions.length === 0 ? (
          <Text size={2} color="default2">
            No transactions on this order yet — create one above.
          </Text>
        ) : (
          <Box display="grid" gap={3}>
            <Box display="grid" gap={1}>
              <Text size={2}>Transaction</Text>
              <Combobox
                options={transactionOptions}
                value={selectedTransactionOption}
                onChange={(val) => setSelectedTransactionId((val as ComboboxOption | null)?.value)}
                size="small"
              />
            </Box>

            {selectedTransaction && (
              <TransactionEventReportForm
                key={selectedTransaction.id}
                transaction={selectedTransaction}
                currency={currency}
                defaultAmount={totalAmount != null ? String(totalAmount) : ""}
                onReported={() => onSuccess("Event reported")}
              />
            )}
          </Box>
        )}
      </WidgetCard>
    </Box>
  );
};

export default OrderDetailsWidget;
