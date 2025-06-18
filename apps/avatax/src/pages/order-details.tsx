// This is rendered as SSR hence we import styles again as `_app.tsx` has no ssr wrapper
import "@saleor/macaw-ui/style";
import "../styles/globals.css";

import { Box, Text, ThemeProvider } from "@saleor/macaw-ui";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return {
    props: {
      skipApp: true,
      queryParams: query,
    },
  };
};

const OrderDetailsPage = ({
  queryParams,
}: {
  queryParams: Record<string, string>;
}) => {
  return (
    <ThemeProvider>
      <Box paddingTop={4} __height={200}>
        {Object.entries(queryParams).map(([key, value]) => (
          <Box
            key={key}
            marginBottom={2}
            display="flex"
            justifyContent="space-between"
          >
            <Text key={key} as="span" fontWeight="bold">
              {key}:
            </Text>
            <Text as="span">{value.length ? value : "n/a"}</Text>
          </Box>
        ))}
      </Box>
    </ThemeProvider>
  );
};

export default OrderDetailsPage;
