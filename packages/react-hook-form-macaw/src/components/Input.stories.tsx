import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Components / Input",
  component: Input,
};

export default meta;

type Story = StoryObj<typeof Input>;

const InputTemplate: Story = {
  render: (args) => {
    const { control, watch, setError } = useForm();
    const name = "inputField";

    if (args.error) {
      setError(name, { message: "Error message" });
    }

    useEffect(() => {
      const subscription = watch((value) => action("[React Hooks Form] Form value changed")(value));

      return () => subscription.unsubscribe();
    }, [watch]);

    return <Input {...args} control={control} label="Input field" name={name} />;
  },
};

export const Default: Story = {
  ...InputTemplate,
};

export const Errored: Story = {
  ...InputTemplate,
  args: {
    error: true,
  },
};

export const Disabled: Story = {
  ...InputTemplate,
  args: {
    disabled: true,
  },
};

export const WithHelpText: Story = {
  ...InputTemplate,
  args: {
    helperText: "Helper text",
  },
};
