import { TextLink } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";

import { trpcClient } from "../../trpc/trpc-client";
import { AppCard } from "../../ui/app-card";
import { Table } from "../../ui/table";
import { TaxCodeSelect } from "./tax-code-select";

export const AvataxTaxCodeMatcherTable = () => {
  const { data: taxClasses = [], isLoading } = trpcClient.taxClasses.getAll.useQuery();

  if (isLoading) {
    return (
      <Box>
        <Text color="default2">Loading...</Text>
      </Box>
    );
  }

  return (
    <AppCard>
      <Table.Container>
        <Table.THead>
          <Table.TR>
            <Table.TH>Saleor tax class</Table.TH>
            <Table.TH>AvaTax tax code</Table.TH>
          </Table.TR>
        </Table.THead>
        <Table.TBody>
          {taxClasses.map((taxClass) => {
            return (
              <Table.TR key={taxClass.id}>
                <Table.TD>{taxClass.name}</Table.TD>
                <Table.TD>
                  <TaxCodeSelect taxClassId={taxClass.id} />
                </Table.TD>
              </Table.TR>
            );
          })}
          <Table.TR>
            <Table.TD>
              <Text display="block" marginTop={8}>
                See AvaTax tax code search to access valid Tax Codes{" "}
                <TextLink href="https://taxcode.avatax.avalara.com/search?q=food" newTab>
                  here
                </TextLink>
              </Text>
            </Table.TD>
          </Table.TR>
        </Table.TBody>
      </Table.Container>
    </AppCard>
  );
};
