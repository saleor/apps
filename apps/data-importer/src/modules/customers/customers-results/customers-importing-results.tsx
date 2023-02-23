import { Button } from "@saleor/macaw-ui";
import { Table, TableBody, Typography } from "@material-ui/core";
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
      <Typography paragraph variant="h3">
        Customers rows from the imported file
      </Typography>

      <Typography paragraph>
        Lines will be imported one by one. Failed imports can be retried, but performed operations
        must be reverted manually. Users will be set to inactive.
      </Typography>
      <Typography paragraph>
        Customers will <strong>not</strong> be informed or notified by this operation.
      </Typography>

      {!importingStarted && (
        <Button
          style={{ margin: "20px 0" }}
          variant="primary"
          onClick={() => setImportingStarted(true)}
        >
          Start importing
        </Button>
      )}

      <Table style={{ marginTop: 50 }}>
        <TableBody>
          {importedLines.map((row) => (
            <CustomerImportingRow
              doImport={importingStarted}
              key={row.customerCreate.email}
              importedModel={row}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
