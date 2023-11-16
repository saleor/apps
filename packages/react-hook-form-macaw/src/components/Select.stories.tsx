import { useEffect } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select";
import { useForm } from "react-hook-form";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof Select> = {
  title: "Components / Select",
  component: Select,
};

export default meta;

type Story = StoryObj<typeof Select>;

const SelectTemplate: Story = {
  render: (args) => {
    const { control, watch, setError } = useForm();
    const name = "selectField";

    if (args.error) {
      setError(name, { message: "Error message" });
    }

    useEffect(() => {
      const subscription = watch((value) => action("[React Hooks Form] Form value changed")(value));

      return () => subscription.unsubscribe();
    }, [watch]);

    return (
      <Select
        {...args}
        control={control}
        label="Select field"
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
  ...SelectTemplate,
};

export const Errored: Story = {
  ...SelectTemplate,
  args: {
    error: true,
  },
};

export const Disabled: Story = {
  ...SelectTemplate,
  args: {
    disabled: true,
  },
};

export const WithHelpText: Story = {
  ...SelectTemplate,
  args: {
    helperText: "Helper text",
  },
};

export const NoValue: Story = {
  ...SelectTemplate,
  args: {},
};
