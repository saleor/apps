import { BoxProps, Chip, ChipProps, Text, TextProps } from "@saleor/macaw-ui";

type ChipVariant = "default" | "warning" | "error" | "success";

const colorPropsBorderMapping: Record<ChipVariant, BoxProps["borderColor"]> = {
  default: "neutralSubdued",
  warning: "criticalDefault",
  error: "criticalDefault",
  success: "neutralDefault",
};

const colorPropsTextMapping: Record<ChipVariant, BoxProps["color"]> = {
  default: "textNeutralPlain",
  warning: "textCriticalDefault",
  error: "textCriticalDefault",
  success: "text2Decorative",
};

const colorPropsBgMapping: Record<ChipVariant, BoxProps["backgroundColor"]> = {
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
