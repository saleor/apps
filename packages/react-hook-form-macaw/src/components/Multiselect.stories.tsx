import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Multiselect } from "./Multiselect";

const meta: Meta<typeof Multiselect> = {
  title: "Components / Multiselect",
  component: Multiselect,
};

export default meta;

type Story = StoryObj<typeof Multiselect>;

const MultiselectTemplate: Story = {
  render: (args) => {
    const { control, watch, setError } = useForm();
    const name = "multiselectField";

    if (args.error) {
      setError(name, { message: "Error message" });
    }

    useEffect(() => {
      const subscription = watch((value) => action("[React Hooks Form] Form value changed")(value));

      return () => subscription.unsubscribe();
    }, [watch]);

    return (
      <Multiselect
        {...args}
        control={control}
        label="Multiselect field"
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
  ...MultiselectTemplate,
};

export const Errored: Story = {
  ...MultiselectTemplate,
  args: {
    error: true,
  },
};

export const Disabled: Story = {
  ...MultiselectTemplate,
  args: {
    disabled: true,
  },
};

export const WithHelpText: Story = {
  ...MultiselectTemplate,
  args: {
    helperText: "Helper text",
  },
};
