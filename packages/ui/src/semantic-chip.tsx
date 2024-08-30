import { BoxProps, Chip, ChipProps, convertSizeToScale, Text, TextProps } from "@saleor/macaw-ui";

type ChipVariant = "default" | "warning" | "error" | "success";

const colorPropsBorderMapping: Record<ChipVariant, BoxProps["borderColor"]> = {
  default: "default1",
  warning: "warning1",
  error: "critical1",
  success: "success1",
};

const colorPropsTextMapping: Record<ChipVariant, BoxProps["color"]> = {
  default: "default1",
  warning: "warning1",
  error: "critical1",
  success: "success1",
};

const colorPropsBgMapping: Record<ChipVariant, BoxProps["backgroundColor"]> = {
  default: "default1",
  warning: "warning1",
  error: "critical1",
  success: "success1",
};

interface ChipTextProps extends ChipProps {
  variant?: "default" | "warning" | "error" | "success";
  innerTextProps?: TextProps;
}

export const SemanticChip = ({
  variant = "default",
  children,
  size,
  innerTextProps,
  ...props
}: ChipTextProps) => {
  return (
    <Chip
      backgroundColor={colorPropsBgMapping[variant]}
      borderColor={colorPropsBorderMapping[variant]}
      size={size}
      {...props}
    >
      <Text
        color={colorPropsTextMapping[variant]}
        size={convertSizeToScale(size)}
        {...innerTextProps}
      >
        {children}
      </Text>
    </Chip>
  );
};
