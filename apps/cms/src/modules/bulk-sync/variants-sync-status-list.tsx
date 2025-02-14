import { SemanticChip } from "@saleor/apps-ui";
import { Box, BoxProps, Text } from "@saleor/macaw-ui";

export type VariantsSyncStatusListItem = {
  productID: string;
  productName: string;
  variantName: string;
  variantId: string;
  status: "pending" | "uploading" | "success" | "error";
};

type Props = {
  variants: Array<VariantsSyncStatusListItem>;
} & BoxProps;

const Row = (props: BoxProps) => (
  <Box
    padding={2}
    display="grid"
    __gridTemplateColumns={"2fr 2fr 1fr"}
    gap={4}
    alignItems="center"
    {...props}
  />
);

export const VariantsSyncStatusList = ({ variants, ...props }: Props) => {
  const renderStatus = (status: VariantsSyncStatusListItem["status"]) => {
    switch (status) {
      case "pending": {
        return null;
      }
      case "success": {
        return <SemanticChip variant="success">Uploaded</SemanticChip>;
      }
      case "error": {
        return <SemanticChip variant="error">Error</SemanticChip>;
      }
      case "uploading": {
        return <SemanticChip variant="default">Uploading</SemanticChip>;
      }
    }
  };

  return (
    <Box {...props}>
      <Row>
        <Text size={2}>Product</Text>
        <Text size={2}>Variant</Text>
        <Text size={2}>Status</Text>
      </Row>
      {variants.map((variant) => (
        <Row key={variant.variantId}>
          <Box>
            <Text size={4} fontWeight="bold" as="p">
              {variant.productName}
            </Text>
            <Text size={3} as="p">
              {variant.productID}
            </Text>
          </Box>
          <Box>
            <Text size={4} fontWeight="bold" as="p">
              {variant.variantName}
            </Text>
            <Text size={3} as="p">
              {variant.variantId}
            </Text>
          </Box>
          <Box>{renderStatus(variant.status)}</Box>
        </Row>
      ))}
    </Box>
  );
};
