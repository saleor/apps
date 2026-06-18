import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import {
  ArrowRightIcon,
  Box,
  Button,
  Combobox,
  ExternalLinkIcon,
  List,
  Text,
  Toggle,
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

interface TransactionResponseOptions {
  value: TransactionEventType;
  label: TransactionEventType;
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

  const [deliveryUpdateResult, deliveryUpdateExecute] = useUpdateDeliveryMutation();
  const handleExecuteDeliveryUpdate = () => {
    deliveryUpdateExecute({
      id: checkoutCreateResult.data?.checkoutCreate?.checkout?.id ?? "",
      methodId: checkoutCreateResult.data?.checkoutCreate?.checkout?.shippingMethods[0]?.id ?? "",
    });
  };

  const [transactionInitializeResult, transactionInitializeExecute] =
    useInitializeTransactionMutation();

  const [completeCheckoutResult, completeCheckoutExecute] = useCompleteCheckoutMutation();

  const handleExecuteInitializeTransaction = () => {
    transactionInitializeExecute({
      id: checkoutCreateResult.data?.checkoutCreate?.checkout?.id ?? "",
      data: {
        event: {
          type: response.value,
          includePspReference,
        },
      } as SyncWebhookRequestData,
    });
  };

  const handleExecuteCheckoutCreate = () => {
    checkoutCreateExecute({
      channelSlug,
      variants: [
        {
          quantity: 1,
          variantId: productsData?.products?.edges[0]?.node.defaultVariant?.id ?? "",
        },
      ],
    });
  };

  const handleExecuteCompleteCheckout = () => {
    completeCheckoutExecute({
      id: checkoutCreateResult.data?.checkoutCreate?.checkout?.id ?? "",
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
    <Box display="grid" gap={8}>
      <Box>
        <Text as="h1" size={6} fontWeight="bold">
          Quick checkout
        </Text>
        <Text size={3} color="default2" marginTop={2}>
          Run a full checkout flow against your Saleor instance — create checkout, set delivery,
          initialize a transaction, and complete the order.
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
              onChange={(value) => setChannelSlug(value as string)}
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
              onChange={(value) => setResponse(value as TransactionResponseOptions)}
              size="small"
              __width="250px"
            />
          </Box>
          <Toggle
            pressed={includePspReference}
            onPressedChange={(pressed) => setIncludePspReference(pressed)}
          >
            <Text>Return pspReference</Text>
          </Toggle>
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
            disabled={channelSlug === "" || fetchingChannels || fetchingProducts}
            onClick={() => handleExecuteCheckoutCreate()}
          >
            Create checkout
          </Button>
          <ArrowRightIcon />
          <Button
            onClick={() => handleExecuteDeliveryUpdate()}
            disabled={!checkoutCreateResult.data}
          >
            Set delivery
          </Button>
          <ArrowRightIcon />
          <Button
            disabled={!checkoutCreateResult.data}
            onClick={() => handleExecuteInitializeTransaction()}
          >
            Initialize transaction
          </Button>
          <ArrowRightIcon />
          <Button
            disabled={!checkoutCreateResult.data || !deliveryUpdateResult.data}
            onClick={() => handleExecuteCompleteCheckout()}
          >
            Complete checkout
          </Button>
        </Box>
      </SectionWithDescription>

      {checkoutCreateResult.data && (
        <Box
          display="grid"
          gap={4}
          padding={5}
          borderRadius={4}
          borderStyle="solid"
          borderWidth={1}
          borderColor="default1"
        >
          <Box display="grid" gap={2}>
            <Text size={4} fontWeight="bold">
              Checkout created
            </Text>
            <Text size={3}>
              ID: {checkoutCreateResult.data.checkoutCreate?.checkout?.id ?? "Error"}
            </Text>
            <Text size={3}>
              Gateways:{" "}
              {checkoutCreateResult.data.checkoutCreate?.checkout?.availablePaymentGateways
                ?.map((gateway) => gateway?.name)
                .join(", ") ?? "Error"}
            </Text>
          </Box>

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
