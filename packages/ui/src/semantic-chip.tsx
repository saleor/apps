import { BoxProps, Chip, ChipProps, Text, TextProps } from "@saleor/macaw-ui/next";

const colorPropsBorderMapping: Record<ChipProps["variant"], BoxProps["borderColor"]> = {
  default: "neutralSubdued",
  warning: "criticalDefault",
  error: "criticalDefault",
  success: "neutralDefault",
};

const colorPropsTextMapping: Record<ChipProps["variant"], BoxProps["color"]> = {
  default: "textNeutralPlain",
  warning: "textCriticalDefault",
  error: "textCriticalDefault",
  success: "text2Decorative",
};

const colorPropsBgMapping: Record<ChipProps["variant"], BoxProps["backgroundColor"]> = {
  default: "surfaceNeutralHighlight",
  warning: "surfaceNeutralHighlight",
  error: "surfaceCriticalSubdued",
  success: "decorativeSurfaceSubdued2",
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
        size={size}
        variant={"caption"}
        {...innerTextProps}
      >
        {children}
      </Text>
    </Chip>
  );
};
