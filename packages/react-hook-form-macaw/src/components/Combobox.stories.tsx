import { useEffect } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Combobox } from "./Combobox";
import { useForm } from "react-hook-form";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof Combobox> = {
  title: "Components / Combobox",
  component: Combobox,
};

export default meta;

type Story = StoryObj<typeof Combobox>;

const ComboboxTemplate: Story = {
  render: (args) => {
    const { control, watch, setError } = useForm();
    const name = "comboboxField";

    if (args.error) {
      setError(name, { message: "Error message" });
    }

    useEffect(() => {
      const subscription = watch((value) => action("[React Hooks Form] Form value changed")(value));

      return () => subscription.unsubscribe();
    }, [watch]);

    return (
      <Combobox
        {...args}
        control={control}
        label="Combobox field"
        name={name}
        options={[
          { value: "1", label: "One" },
          { value: "2", label: "Two" },
          { value: "3", label: "Three" },
        ]}
      />
    );
  },
};

export const Default: Story = {
  ...ComboboxTemplate,
};

export const Errored: Story = {
  ...ComboboxTemplate,
  args: {
    error: true,
  },
};

export const Disabled: Story = {
  ...ComboboxTemplate,
  args: {
    disabled: true,
  },
};

export const WithHelpText: Story = {
  ...ComboboxTemplate,
  args: {
    helperText: "Helper text",
  },
};

export const NoValue: Story = {
  ...ComboboxTemplate,
  args: {},
};
