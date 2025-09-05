import { DynamicCombobox, Option } from "@saleor/macaw-ui";

import { useTaxCodeCombobox } from "./use-tax-code-combobox";

export const TaxCodeCombobox = ({
  taxClassId,
  initialValue,
}: {
  taxClassId: string;
  initialValue: Option | null;
}) => {
  const { options, loading, value, onChange, onInputValueChange, disabled } = useTaxCodeCombobox({
    taxClassId,
    initialValue,
  });

  return (
    <DynamicCombobox
      options={options}
      loading={loading}
      value={value}
      onChange={onChange}
      onInputValueChange={onInputValueChange}
      disabled={disabled}
    />
  );
};
