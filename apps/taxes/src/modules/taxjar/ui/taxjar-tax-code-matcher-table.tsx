import { useDashboardNotification } from "@saleor/apps-shared";
import { Select } from "@saleor/macaw-ui/next";
import React from "react";
import { trpcClient } from "../../trpc/trpc-client";
import { Table } from "../../ui/table";

const SelectTaxCode = ({ taxClassId }: { taxClassId: string }) => {
  const [value, setValue] = React.useState("");
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { mutate: updateMutation } = trpcClient.taxJarMatches.upsert.useMutation({
    onSuccess() {
      notifySuccess("Success", "Updated TaxJar tax code matches");
    },
    onError(error) {
      notifyError("Error", error.message);
    },
  });

  const { data: providers } = trpcClient.providersConfiguration.getAll.useQuery();

  const firstConnectionId = providers?.[0].id;

  const { data: taxCodes = [] } = trpcClient.taxJarTaxCodes.getAllForId.useQuery(
    {
      connectionId: firstConnectionId!,
    },
    {
      enabled: firstConnectionId !== undefined,
    }
  );

  const changeValue = (taxJarTaxCode: string) => {
    setValue(taxJarTaxCode);
    updateMutation({
      saleorTaxClassId: taxClassId,
      taxJarTaxCode,
    });
  };

  return (
    <Select
      value={value ?? ""}
      onChange={(value) => changeValue(String(value))}
      options={[
        { value: "", label: "Not assigned" },
        ...taxCodes.map((item) => ({
          value: item.code,
          label: `${item.code} | ${item.description}`,
        })),
      ]}
    />
  );
};

export const TaxJarTaxCodeMatcherTable = ({}) => {
  const { data: taxClasses = [] } = trpcClient.taxClasses.getAll.useQuery();

  return (
    <section>
      <Table.Container>
        <Table.THead>
          <Table.TR>
            <Table.TH>Saleor tax class</Table.TH>
            <Table.TH>TaxJar tax code</Table.TH>
          </Table.TR>
        </Table.THead>
        <Table.TBody>
          {taxClasses.map((taxClass) => {
            return (
              <Table.TR key={taxClass.id}>
                <Table.TD>{taxClass.name}</Table.TD>
                <Table.TD>
                  <SelectTaxCode taxClassId={taxClass.id} />
                </Table.TD>
              </Table.TR>
            );
          })}
        </Table.TBody>
      </Table.Container>
    </section>
  );
};
