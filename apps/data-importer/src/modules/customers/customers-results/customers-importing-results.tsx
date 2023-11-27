import { Box, Button, Text } from "@saleor/macaw-ui";
import { CustomerImportingRow } from "./customer-importing-row";
import React, { useState } from "react";
import { CustomerColumnSchema } from "../customers-importer-nuvo/customers-columns-model";

export const CustomersImportingResults = ({
  importedLines,
}: {
  importedLines: CustomerColumnSchema[];
}) => {
  const [importingStarted, setImportingStarted] = useState(false);

  return (
    <div style={{ marginTop: 20 }}>
      <Text display="block" variant="heading">
        Customers rows from the imported file
      </Text>

      <Text display="block">
        Lines will be imported one by one. Failed imports can be retried, but performed operations
        must be reverted manually. Users will be set to inactive.
      </Text>
      <Text display="block">
        Customers will <strong>not</strong> be informed or notified by this operation.
      </Text>

      {!importingStarted && (
        <Button
          style={{ margin: "20px 0" }}
          variant="primary"
          onClick={() => setImportingStarted(true)}
        >
          Start importing
        </Button>
      )}

      <Box style={{ marginTop: 50 }}>
        {importedLines.map((row) => (
          <CustomerImportingRow
            doImport={importingStarted}
            key={row.customerCreate.email}
            importedModel={row}
          />
        ))}
      </Box>
    </div>
  );
};
