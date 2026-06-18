import { Box, Button, Input, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import { SectionWithDescription } from "@/components/section-with-description";
import { useTransactionDetailsViaPspQuery } from "@/generated/graphql";

const TransactionsPage = () => {
  const router = useRouter();
  const [pspReference, setPspReference] = React.useState<string>("");
  const [transactionId, setTransactionId] = React.useState<string>("");
  const [notFoundError, setNotFoundError] = React.useState(false);

  const [{ data, error: apiError }, fetchTransactions] = useTransactionDetailsViaPspQuery({
    variables: {
      pspReference,
    },
    pause: true,
  });

  useEffect(() => {
    if (data) {
      const transaction = data?.orders?.edges[0]?.node?.transactions.find((transaction) => {
        return transaction?.pspReference === pspReference;
      });

      if (transaction) {
        router.push(`/app/transactions/${transaction.id}`);
      } else {
        setNotFoundError(true);
      }
    }
  }, [data, pspReference, router]);

  const displayError = notFoundError || apiError;

  return (
    <Box display="grid" gap={8}>
      <Box>
        <Text as="h1" size={6} fontWeight="bold">
          Event reporter
        </Text>
        <Text size={3} color="default2" marginTop={2}>
          Look up a transaction from a test checkout or storefront order, then manually fire
          transaction events.
        </Text>
      </Box>

      <SectionWithDescription
        title="Find transaction"
        description={
          <Text size={3} color="default2">
            Enter a PSP reference returned by the gateway, or paste a Saleor TransactionItem ID
            directly.
          </Text>
        }
      >
        <Box display="grid" gap={4}>
          <Input
            label="PSP reference"
            value={pspReference}
            disabled={!!transactionId}
            onChange={(event) => setPspReference(event.target.value)}
          />
          <Input
            label="Transaction ID"
            value={transactionId}
            disabled={!!pspReference}
            onChange={(event) => setTransactionId(event.target.value)}
          />
          <Box display="flex" gap={2}>
            <Button
              variant="secondary"
              onClick={() => {
                setPspReference("");
                setTransactionId("");
                setNotFoundError(false);
              }}
            >
              Clear
            </Button>
            <Button
              onClick={() => {
                setNotFoundError(false);
                if (transactionId) {
                  router.push(`/app/transactions/${transactionId}`);
                } else {
                  fetchTransactions();
                }
              }}
              disabled={!pspReference && !transactionId}
              variant={displayError ? "error" : "primary"}
            >
              Go to transaction
            </Button>
          </Box>
          {notFoundError && <Text color="critical1">Invalid PSP reference</Text>}
          {apiError && <Text color="critical1">Error fetching transaction</Text>}
        </Box>
      </SectionWithDescription>
    </Box>
  );
};

export default TransactionsPage;
