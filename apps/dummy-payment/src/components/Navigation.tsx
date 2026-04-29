import { Box, ConfigurationIcon, HomeIcon, OrdersIcon, SellsIcon } from "@saleor/macaw-ui";
import { NavigationTile } from "./NavigationTile";

export const ROUTES = {
  dashboard: "/app",
  checkout: "/app/checkout",
  transactions: "/app/transactions",
  configuration: "/app/configuration",
} as const;

export const Navigation = () => {
  return (
    <Box width="100%" backgroundColor="default2" __height="10vh">
      <Box display="flex" flexDirection="row" gap={4} padding={4}>
        <NavigationTile href={ROUTES.dashboard}>
          <HomeIcon />
          Home
        </NavigationTile>
        <NavigationTile href={ROUTES.checkout}>
          <OrdersIcon />
          Quick checkout
        </NavigationTile>
        <NavigationTile href={ROUTES.transactions}>
          <SellsIcon />
          Event reporter
        </NavigationTile>
        <NavigationTile href={ROUTES.configuration}>
          <ConfigurationIcon />
          Configuration
        </NavigationTile>
      </Box>
    </Box>
  );
};
