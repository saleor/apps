import { AppCard } from "../../ui/app-card";
import { Table } from "../../ui/table";
import { TaxCodeCombobox } from "./tax-code-combobox";
import { useTaxClassesWithMatches } from "./use-tax-classes-with-matches";

export const AvataxTaxCodeMatcherTable = () => {
  const { taxClasses, isLoading, findOptionMatchForTaxClass } = useTaxClassesWithMatches();

  if (isLoading) {
    return (
      <AppCard>
        <Table.Skeleton />
      </AppCard>
    );
  }

  return (
    <AppCard>
      <Table.Container>
        <Table.THead>
          <Table.TR>
            <Table.TH __width="30%">Saleor tax class</Table.TH>
            <Table.TH>AvaTax tax code</Table.TH>
          </Table.TR>
        </Table.THead>
        <Table.TBody>
          {taxClasses.map((taxClass) => {
            return (
              <Table.TR key={taxClass.id}>
                <Table.TD>{taxClass.name}</Table.TD>
                <Table.TD>
                  <TaxCodeCombobox
                    taxClassId={taxClass.id}
                    initialValue={findOptionMatchForTaxClass(taxClass.id)}
                  />
                </Table.TD>
              </Table.TR>
            );
          })}
        </Table.TBody>
      </Table.Container>
    </AppCard>
  );
};
