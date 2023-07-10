import { Box, BoxProps, Text } from "@saleor/macaw-ui/next";

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
  <Box padding={2} display="grid" __gridTemplateColumns={"2fr 2fr 1fr"} gap={4} {...props} />
);

export const VariantsSyncStatusList = ({ variants, ...props }: Props) => {
  const renderStatus = (status: VariantsSyncStatusListItem["status"]) => {
    switch (status) {
      case "pending": {
        return <Text>Waiting...</Text>;
      }
      case "success": {
        return <Text>Uploaded ✅</Text>;
      }
      case "error": {
        return <Text>Error ❌</Text>;
      }
      case "uploading": {
        return <Text>Uploading 🚀</Text>;
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
