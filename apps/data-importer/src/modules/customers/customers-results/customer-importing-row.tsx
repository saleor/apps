import { Box, TableCell, TableRow, Typography } from "@material-ui/core";
import { Done, Error, HourglassEmpty } from "@material-ui/icons";
import React, { memo, useCallback, useEffect, useState } from "react";
import { useCustomerCreateMutation } from "../../../../generated/graphql";
import { CustomerColumnSchema } from "../customers-importer-nuvo/customers-columns-model";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Button } from "@saleor/macaw-ui";

type Props = {
  importedModel: CustomerColumnSchema;
  doImport: boolean;
};

const ImportedStatus = ({ id }: { id: string }) => {
  const { appBridge } = useAppBridge();

  return (
    <Box style={{ gap: 20, display: "flex", alignItems: "center" }}>
      <Done color="primary" width={30} />
      <span
        style={{ cursor: "pointer" }}
        onClick={() => {
          appBridge?.dispatch(
            actions.Redirect({
              // newContext: true, // open in new context but dashboard has a bug here
              to: `/customers/${id}`,
            })
          );
        }}
      >
        Imported with ID <code>{id}</code>
      </span>
    </Box>
  );
};

const ErrorStatus = ({ message, onRetry }: { message: string; onRetry(): void }) => {
  return (
    <Box style={{ gap: 20, display: "flex", alignItems: "center" }}>
      <Error width={30} color="error" />
      <span color="error">Error importing: {message}</span>
      <Button onClick={onRetry}>Retry</Button>
    </Box>
  );
};
const PendingStatus = () => (
  <Box style={{ gap: 20, display: "flex", alignItems: "center" }}>
    <HourglassEmpty width={30} />
    <span>Importing...</span>
  </Box>
);

export const CustomerImportingRow = (props: Props) => {
  const [mutationResult, mutate] = useCustomerCreateMutation();
  const triggerMutation = useCallback(() => {
    mutate({
      input: {
        ...props.importedModel.customerCreate,
        // todo map address
        defaultShippingAddress: null,
        defaultBillingAddress: null,
        isActive: false,
      },
    });
  }, [props.importedModel, mutate]);

  useEffect(() => {
    if (
      props.doImport &&
      !mutationResult.data &&
      !mutationResult.error &&
      !mutationResult.fetching
    ) {
      triggerMutation();
    }
  }, [props.doImport, mutate, mutationResult, triggerMutation]);

  const renderStatus = () => {
    if (mutationResult.data?.customerCreate?.user?.id) {
      return <ImportedStatus id={mutationResult.data?.customerCreate?.user?.id} />;
    }

    if (mutationResult.data?.customerCreate?.errors) {
      return (
        <ErrorStatus
          onRetry={triggerMutation}
          message={mutationResult.data?.customerCreate?.errors[0].message ?? "Error importing"}
        />
      );
    }

    if (mutationResult.fetching) {
      return <PendingStatus />;
    }
  };

  return (
    <TableRow>
      <TableCell>{props.importedModel.customerCreate.email}</TableCell>
      <TableCell>{renderStatus()}</TableCell>
    </TableRow>
  );
};
