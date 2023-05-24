import { Text, Chip, ChipProps } from "@saleor/macaw-ui/next";

const colorPropsMapping: Record<ChipProps["variant"], ChipProps["borderColor"]> = {
  default: "neutralSubdued",
  warning: "brandHighlight",
  error: "criticalDefault",
  success: "neutralDefault",
};

interface ChipTextProps {
  variant?: "default" | "warning" | "error" | "success";
  content: string;
}

export const ChipText = ({ variant = "default", content }: ChipTextProps) => {
  const commonProps: ChipProps = {
    __maxWidth: "max-content",
    display: "flex",
    borderStyle: "solid",
    borderWidth: 1,
  };

  return (
    <Chip {...commonProps} borderColor={colorPropsMapping[variant]}>
      <Text color="textNeutralDefault" size="small" variant="caption">
        {content}
      </Text>
    </Chip>
  );
};
