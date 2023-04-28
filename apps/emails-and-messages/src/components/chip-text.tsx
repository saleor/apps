import { Text, Chip, ChipProps } from "@saleor/macaw-ui/next";

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

  // TODO: Choose colors for variants
  switch (variant) {
    case "default":
      return (
        <Chip {...commonProps} borderColor={"neutralSubdued"}>
          <Text color="textNeutralDefault" size="small" variant="caption">
            {content}
          </Text>
        </Chip>
      );
    case "warning":
      return (
        <Chip {...commonProps} borderColor={"brandHighlight"}>
          <Text color="textNeutralDefault" size="small" variant="caption">
            {content}
          </Text>
        </Chip>
      );

    case "error":
      return (
        <Chip {...commonProps} borderColor={"criticalDefault"}>
          <Text color="textNeutralDefault" size="small" variant="caption">
            {content}
          </Text>
        </Chip>
      );

    case "success":
      return (
        <Chip {...commonProps} borderColor={"neutralDefault"}>
          <Text color="textNeutralDefault" size="small" variant="caption">
            {content}
          </Text>
        </Chip>
      );
  }
};
