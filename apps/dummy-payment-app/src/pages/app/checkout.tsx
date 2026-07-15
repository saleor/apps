import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import {
  ArrowRightIcon,
  Box,
  Button,
  Checkbox,
  Combobox,
  ExternalLinkIcon,
  Input,
  List,
  Text,
  Toggle,
  TrashBinIcon,
} from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import React from "react";

import { SectionWithDescription } from "@/components/section-with-description";
import {
  useChannelsListQuery,
  useCompleteCheckoutMutation,
  useCreateCheckoutMutation,
  useInitializeTransactionMutation,
  useProductListQuery,
  useUpdateDeliveryMutation,
} from "@/generated/graphql";
import { type TransactionEventType, transactionEventTypeSchema } from "@/modules/validation/common";
import { type SyncWebhookRequestData } from "@/modules/validation/sync-transaction";
import { trpcClient } from "@/trpc-client";

interface TransactionResponseOptions {
  value: TransactionEventType;
  label: TransactionEventType;
}

/**
 * A checkout line being built in the UI, before it is turned into a `CheckoutLineInput`.
 * When `customPrice` is enabled, `price` (and optionally `reason`) are sent to Saleor. Setting a
 * custom price requires the `HANDLE_CHECKOUTS` permission (see manifest). Core rejects a reason
 * without a price, so we only send `priceOverrideReason` together with a `price`.
 */
interface CheckoutLineDraft {
  variantId: string;
  productName: string;
  quantity: number;
  customPrice: boolean;
  price: string;
  reason: string;
}

const CheckoutPage = () => {
  const router = useRouter();
  const { appBridge } = useAppBridge();
  const [response, setResponse] = React.useState<TransactionResponseOptions>({
    value: "CHARGE_SUCCESS",
    label: "CHARGE_SUCCESS",
  });
  const [channelSlug, setChannelSlug] = React.useState<string>("");
  const [includePspReference, setIncludePspReference] = React.useState<boolean>(true);

  const [{ data: channelsData, fetching: fetchingChannels }] = useChannelsListQuery();
  const [{ data: productsData, fetching: fetchingProducts }] = useProductListQuery({
    pause: channelSlug === "",
    variables: { channelSlug },
  });
  const [checkoutCreateResult, checkoutCreateExecute] = useCreateCheckoutMutation();
  /**
   * Server-side checkout create. Used only when a line has a price override, so the Saleor call
   * is logged (behind `LOG_SALEOR_OPERATIONS`) and its error is forwarded to the UI. Checkouts
   * without a price override keep using the client-side `checkoutCreateExecute` above.
   */
  const checkoutCreateServer = trpcClient.checkout.create.useMutation();

  // Lines added to the checkout. Reset when the channel changes, since variants are channel-scoped.
  const [lines, setLines] = React.useState<CheckoutLineDraft[]>([]);

  // Unified view over the two create paths (client-side urql vs. server-side tRPC).
  const createdCheckout =
    checkoutCreateServer.data?.checkout ??
    checkoutCreateResult.data?.checkoutCreate?.checkout ??
    null;
  const createCheckoutErrors =
    checkoutCreateServer.data?.errors ?? checkoutCreateResult.data?.checkoutCreate?.errors ?? [];
  // Top-level error forwarded from either path (tRPC error, or urql network/GraphQL error).
  const createCheckoutErrorMessage =
    checkoutCreateServer.error?.message ?? checkoutCreateResult.error?.message ?? null;
  const isCreatingCheckout = checkoutCreateResult.fetching || checkoutCreateServer.isLoading;
  const hasCheckoutOutcome = Boolean(
    createdCheckout || createCheckoutErrors.length > 0 || createCheckoutErrorMessage,
  );

  const [deliveryUpdateResult, deliveryUpdateExecute] = useUpdateDeliveryMutation();
  const handleExecuteDeliveryUpdate = () => {
    deliveryUpdateExecute({
      id: createdCheckout?.id ?? "",
      methodId: createdCheckout?.shippingMethods[0]?.id ?? "",
    });
  };

  const [transactionInitializeResult, transactionInitializeExecute] =
    useInitializeTransactionMutation();

  const [completeCheckoutResult, completeCheckoutExecute] = useCompleteCheckoutMutation();

  /**
   * Any in-flight query or mutation. While something is loading we disable interactive controls
   * and show a busy cursor, so the user can't fire overlapping operations.
   */
  const isBusy =
    fetchingChannels ||
    fetchingProducts ||
    isCreatingCheckout ||
    deliveryUpdateResult.fetching ||
    transactionInitializeResult.fetching ||
    completeCheckoutResult.fetching;

  // Draft of the line currently being configured before "Add line" is pressed.
  const [draftVariantId, setDraftVariantId] = React.useState<string>("");
  const [draftQuantity, setDraftQuantity] = React.useState<string>("1");
  const [draftCustomPrice, setDraftCustomPrice] = React.useState<boolean>(false);
  const [draftPrice, setDraftPrice] = React.useState<string>("");
  const [draftReason, setDraftReason] = React.useState<string>("");

  const productOptions = (productsData?.products?.edges ?? [])
    .filter((edge) => edge.node.defaultVariant?.id)
    .map((edge) => ({
      value: edge.node.defaultVariant?.id as string,
      label: edge.node.name,
    }));

  const resetDraft = () => {
    setDraftVariantId("");
    setDraftQuantity("1");
    setDraftCustomPrice(false);
    setDraftPrice("");
    setDraftReason("");
  };

  const quantityNumber = Number.parseInt(draftQuantity, 10);
  const isDraftValid =
    draftVariantId !== "" &&
    Number.isFinite(quantityNumber) &&
    quantityNumber > 0 &&
    // When a custom price is used, it must be a positive number (Saleor's PositiveDecimal).
    (!draftCustomPrice || (draftPrice !== "" && Number(draftPrice) > 0));

  const handleAddLine = () => {
    if (!isDraftValid) {
      return;
    }

    const productName =
      productOptions.find((option) => option.value === draftVariantId)?.label ?? draftVariantId;

    setLines((current) => [
      ...current,
      {
        variantId: draftVariantId,
        productName,
        quantity: quantityNumber,
        customPrice: draftCustomPrice,
        price: draftPrice,
        reason: draftReason,
      },
    ]);
    resetDraft();
  };

  const handleRemoveLine = (index: number) => {
    setLines((current) => current.filter((_, i) => i !== index));
  };

  const handleExecuteInitializeTransaction = () => {
    transactionInitializeExecute({
      id: createdCheckout?.id ?? "",
      data: {
        event: {
          type: response.value,
          includePspReference,
        },
      } as SyncWebhookRequestData,
    });
  };

  const handleExecuteCheckoutCreate = () => {
    const usesPriceOverride = lines.some((line) => line.customPrice);

    const variants = lines.map((line) => {
      const variant: {
        variantId: string;
        quantity: number;
        price?: string;
        priceOverrideReason?: string;
      } = {
        variantId: line.variantId,
        quantity: line.quantity,
      };

      /*
       * `price` and `priceOverrideReason` are only sent when a custom price is enabled. A reason
       * without a price is rejected by Saleor, so both travel together.
       */
      if (line.customPrice) {
        variant.price = line.price;

        if (line.reason.trim() !== "") {
          variant.priceOverrideReason = line.reason;
        }
      }

      return variant;
    });

    if (usesPriceOverride) {
      // Route through the backend so the price-override operation is logged and errors surface.
      checkoutCreateServer.mutate({ channelSlug, variants });
    } else {
      checkoutCreateExecute({ channelSlug, variants });
    }
  };

  const handleExecuteCompleteCheckout = () => {
    completeCheckoutExecute({
      id: createdCheckout?.id ?? "",
    });
  };

  const navigateToTransaction = (id: string | undefined) => {
    if (id) {
      router.push(`/app/transactions/${id}`);
    }
  };

  const navigateToOrder = (id: string) => {
    appBridge?.dispatch(
      actions.Redirect({
        to: `/orders/${id}`,
        newContext: true,
      }),
    );
  };

  return (
    <Box display="grid" gap={8} __cursor={isBusy ? "wait" : undefined}>
      <Box>
        <Text as="h1" size={6} fontWeight="bold">
          Quick checkout
        </Text>
        <Text size={3} color="default2" marginTop={2}>
          Run a full checkout flow against your Saleor instance — add lines, create checkout, set
          delivery, initialize a transaction, and complete the order.
        </Text>
      </Box>

      <SectionWithDescription
        title="Setup"
        description={
          <Text size={3} color="default2">
            Choose a channel and the transaction outcome the dummy gateway should return.
          </Text>
        }
      >
        <Box display="grid" gap={4}>
          <Box display="flex" gap={2} alignItems="center">
            <Text size={3}>Channel</Text>
            <Combobox
              value={channelSlug}
              disabled={isBusy}
              onChange={(value) => {
                setChannelSlug(value as string);
                // Variants are channel-scoped, so lines built for another channel no longer apply.
                setLines([]);
                resetDraft();
                checkoutCreateServer.reset();
              }}
              options={(channelsData?.channels ?? []).map((value) => ({
                value: value.slug,
                label: value.name,
              }))}
            />
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <Text size={3}>Transaction response</Text>
            <Combobox
              options={transactionEventTypeSchema.options.map((value) => ({
                label: value,
                value,
              }))}
              value={response}
              disabled={isBusy}
              onChange={(value) => setResponse(value as TransactionResponseOptions)}
              size="small"
              __width="250px"
            />
          </Box>
          <Toggle
            pressed={includePspReference}
            disabled={isBusy}
            onPressedChange={(pressed) => setIncludePspReference(pressed)}
          >
            <Text>Return pspReference</Text>
          </Toggle>
        </Box>
      </SectionWithDescription>

      <SectionWithDescription
        title="Lines"
        description={
          <Text size={3} color="default2">
            Add one or more lines to the checkout. Enable &quot;Custom price&quot; to override the
            variant price and provide an optional reason (requires the app to have the{" "}
            <Text as="span" fontWeight="bold">
              HANDLE_CHECKOUTS
            </Text>{" "}
            permission).
          </Text>
        }
      >
        <Box display="grid" gap={4}>
          <Box display="flex" gap={4} alignItems="flex-end" flexWrap="wrap">
            <Box display="grid" gap={1} __cursor={fetchingProducts ? "wait" : undefined}>
              <Text size={2} color="default2">
                Product
              </Text>
              <Combobox
                value={draftVariantId}
                onChange={(value) => setDraftVariantId((value as string) ?? "")}
                options={productOptions}
                disabled={channelSlug === "" || isBusy}
                __width="280px"
              />
            </Box>
            <Input
              type="number"
              label="Quantity"
              value={draftQuantity}
              min={1}
              disabled={isBusy}
              onChange={(event) => setDraftQuantity(event.target.value)}
              __width="120px"
            />
          </Box>

          <Checkbox
            checked={draftCustomPrice}
            disabled={isBusy}
            onCheckedChange={(checked) => setDraftCustomPrice(checked === true)}
          >
            <Text>Custom price</Text>
          </Checkbox>

          {draftCustomPrice && (
            <Box display="flex" gap={4} alignItems="flex-start" flexWrap="wrap">
              <Input
                type="number"
                label="Price"
                value={draftPrice}
                min={0}
                disabled={isBusy}
                onChange={(event) => setDraftPrice(event.target.value)}
                __width="160px"
              />
              <Input
                type="text"
                label="Reason (optional)"
                value={draftReason}
                disabled={isBusy}
                onChange={(event) => setDraftReason(event.target.value)}
                __width="320px"
              />
            </Box>
          )}

          <Box>
            <Button
              variant="secondary"
              disabled={!isDraftValid || isBusy}
              onClick={() => handleAddLine()}
            >
              Add line
            </Button>
          </Box>

          {lines.length > 0 && (
            <List display="grid" gap={2}>
              {lines.map((line, index) => (
                <List.Item
                  key={`${line.variantId}-${index}`}
                  padding={3}
                  borderRadius={3}
                  borderStyle="solid"
                  borderWidth={1}
                  borderColor="default1"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={4}
                >
                  <Box display="grid" gap={1}>
                    <Text size={3} fontWeight="medium">
                      {line.productName} × {line.quantity}
                    </Text>
                    {line.customPrice && (
                      <Text size={2} color="default2">
                        Custom price: {line.price}
                        {line.reason.trim() !== "" ? ` — "${line.reason}"` : ""}
                      </Text>
                    )}
                  </Box>
                  <Button
                    variant="tertiary"
                    icon={<TrashBinIcon />}
                    disabled={isBusy}
                    onClick={() => handleRemoveLine(index)}
                  />
                </List.Item>
              ))}
            </List>
          )}
        </Box>
      </SectionWithDescription>

      <SectionWithDescription
        title="Checkout flow"
        description={
          <Text size={3} color="default2">
            Execute each step in order. Steps unlock as the previous one completes.
          </Text>
        }
      >
        <Box display="flex" gap={4} alignItems="center" flexWrap="wrap">
          <Button
            disabled={channelSlug === "" || lines.length === 0 || isBusy}
            onClick={() => handleExecuteCheckoutCreate()}
          >
            Create checkout
          </Button>
          <ArrowRightIcon />
          <Button
            onClick={() => handleExecuteDeliveryUpdate()}
            disabled={!createdCheckout || isBusy}
          >
            Set delivery
          </Button>
          <ArrowRightIcon />
          <Button
            disabled={!createdCheckout || isBusy}
            onClick={() => handleExecuteInitializeTransaction()}
          >
            Initialize transaction
          </Button>
          <ArrowRightIcon />
          <Button
            disabled={!createdCheckout || !deliveryUpdateResult.data || isBusy}
            onClick={() => handleExecuteCompleteCheckout()}
          >
            Complete checkout
          </Button>
        </Box>
      </SectionWithDescription>

      {hasCheckoutOutcome && (
        <Box
          display="grid"
          gap={4}
          padding={5}
          borderRadius={4}
          borderStyle="solid"
          borderWidth={1}
          borderColor="default1"
        >
          {createCheckoutErrorMessage && (
            <Box display="grid" gap={1}>
              <Text size={4} fontWeight="bold" color="critical1">
                Checkout create failed
              </Text>
              <Text size={3} color="critical1">
                {createCheckoutErrorMessage}
              </Text>
            </Box>
          )}

          {createCheckoutErrors.length > 0 && (
            <Box display="grid" gap={1}>
              <Text size={4} fontWeight="bold" color="critical1">
                Checkout create errors
              </Text>
              {createCheckoutErrors.map((error, index) => (
                <Text key={index} size={3} color="critical1">
                  {error.field ? `${error.field}: ` : ""}
                  {error.message}
                </Text>
              ))}
            </Box>
          )}

          {createdCheckout && (
            <Box display="grid" gap={2}>
              <Text size={4} fontWeight="bold">
                Checkout created
              </Text>
              <Text size={3}>ID: {createdCheckout.id}</Text>
              <Text size={3}>
                Gateways:{" "}
                {createdCheckout.availablePaymentGateways
                  ?.map((gateway) => gateway?.name)
                  .join(", ") ?? "Error"}
              </Text>

              <Box display="grid" gap={1} marginTop={2}>
                <Text size={3} fontWeight="medium">
                  Lines
                </Text>
                <List display="flex" flexDirection="column" gap={1}>
                  {createdCheckout.lines.map((line) => (
                    <List.Item key={line.id}>
                      <Text size={3}>
                        {line.variant.name} × {line.quantity} — {line.undiscountedUnitPrice.amount}{" "}
                        {line.undiscountedUnitPrice.currency}
                        {line.priceOverrideReason ? ` (reason: "${line.priceOverrideReason}")` : ""}
                      </Text>
                    </List.Item>
                  ))}
                </List>
              </Box>
            </Box>
          )}

          {deliveryUpdateResult.data &&
            (deliveryUpdateResult.error ? (
              <Text color="critical1" fontWeight="bold">
                Error setting shipping method
              </Text>
            ) : (
              <Text fontWeight="bold" color="success1">
                Shipping method set
              </Text>
            ))}

          {transactionInitializeResult.data && (
            <Box display="grid" gap={2}>
              <Text size={4} fontWeight="bold">
                Transaction initialized
              </Text>
              <List display="flex" flexDirection="column" gap={1}>
                <List.Item>
                  <Text marginRight={1}>pspReference:</Text>
                  <Text fontWeight="medium">
                    {transactionInitializeResult.data.transactionInitialize?.transactionEvent
                      ?.pspReference || "<missing>"}
                  </Text>
                </List.Item>
                <List.Item>
                  <Text marginRight={1}>transactionId:</Text>
                  <Text fontWeight="medium">
                    {transactionInitializeResult.data.transactionInitialize?.transaction?.id ||
                      "<missing>"}
                  </Text>
                </List.Item>
                <List.Item>
                  <Text marginRight={1}>Event type:</Text>
                  <Text fontWeight="medium">
                    {transactionInitializeResult.data.transactionInitialize?.transactionEvent
                      ?.type ?? "Error type"}
                  </Text>
                </List.Item>
              </List>
              {transactionInitializeResult.data.transactionInitialize?.transaction?.id && (
                <Box
                  onClick={() =>
                    navigateToTransaction(
                      transactionInitializeResult.data?.transactionInitialize?.transaction?.id,
                    )
                  }
                  cursor="pointer"
                  color="accent1"
                  display="flex"
                  gap={2}
                  alignItems="center"
                >
                  <ExternalLinkIcon />
                  <Text fontWeight="bold" color="accent1">
                    Report changes on transaction
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {completeCheckoutResult.data && (
            <Box
              onClick={() =>
                navigateToOrder(completeCheckoutResult.data?.checkoutComplete?.order?.id ?? "")
              }
              cursor="pointer"
              color="accent1"
              display="flex"
              gap={2}
              alignItems="center"
            >
              <ExternalLinkIcon />
              <Text fontWeight="bold" color="accent1">
                Created order{" "}
                {completeCheckoutResult.data.checkoutComplete?.order?.number ?? "Error"}
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CheckoutPage;
