import { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Dummy } from "./dummy";

const meta: Meta<typeof Dummy> = {
  title: "Components / Input",
  tags: ["autodocs"],
  component: Dummy,
  args: {
    label: "Label",
    size: "large",
  },
};

export default meta;
type Story = StoryObj<typeof Dummy>;

const InputTemplate: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState("Input content");

    return <Dummy />;
  },
};

export const Default: Story = {
  ...InputTemplate,
  parameters: {
    docs: {
      source: {
        code: `
  const [value, setValue] = useState("Input content");

  <Input
    label="Label"
    size="large"
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />`,
      },
    },
  },
};

export const Errored: Story = {
  ...InputTemplate,
  args: {
    error: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
  const [value, setValue] = useState("Input content");
  
  <Input
    label="Label"
    size="large"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    error
  />`,
      },
    },
  },
};

export const Disabled: Story = {
  ...InputTemplate,
  args: {
    disabled: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
  const [value, setValue] = useState("Input content");
  
  <Input
    label="Label"
    size="large"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    disabled
  />`,
      },
    },
  },
};

export const WithHelpText: Story = {
  ...InputTemplate,
  args: {
    helperText: "Helper text",
  },
  parameters: {
    docs: {
      source: {
        code: `
  const [value, setValue] = useState("Input content");
  
  <Input
    label="Label"
    size="large"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    helperText="Helper text"
  />`,
      },
    },
  },
};
