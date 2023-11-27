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
        <Text variant="caption">Product</Text>
        <Text variant="caption">Variant</Text>
        <Text variant="caption">Status</Text>
      </Row>
      {variants.map((variant) => (
        <Row key={variant.variantId}>
          <Box>
            <Text variant="bodyStrong" as="p">
              {variant.productName}
            </Text>
            <Text size="small" as="p">
              {variant.productID}
            </Text>
          </Box>
          <Box>
            <Text variant="bodyStrong" as="p">
              {variant.variantName}
            </Text>
            <Text size="small" as="p">
              {variant.variantId}
            </Text>
          </Box>
          <Box>{renderStatus(variant.status)}</Box>
        </Row>
      ))}
    </Box>
  );
};
