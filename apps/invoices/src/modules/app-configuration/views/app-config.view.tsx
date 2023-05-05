import { Box, Text } from "@saleor/macaw-ui/next";
import { DefaultShopAddress } from "../../shop-info/ui/default-shop-address";

export const AppConfigView = () => {
  return (
    <Box>
      <Box
        display={"grid"}
        justifyContent={"space-between"}
        __gridTemplateColumns={"400px 400px"}
        gap={13}
      >
        <Box>
          <Text as={"h1"} variant={"hero"} marginBottom={8}>
            Configuration
          </Text>
          <Text as={"p"} marginBottom={4}>
            The Invoices App will generate invoices for each order, for which{" "}
            <code>INVOICE_REQUESTED</code> event will be triggered
          </Text>
          <Text as={"p"} marginBottom={4}>
            By default it will use <a href={"todo"}>site settings</a> address, but each channel can
            be configured separately
          </Text>
        </Box>
        <Box>
          <DefaultShopAddress />
        </Box>
      </Box>
    </Box>
  );
};
