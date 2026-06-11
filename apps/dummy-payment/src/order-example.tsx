import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Text } from "@saleor/macaw-ui";
import gql from "graphql-tag";
import Link from "next/link";
import { useLastOrderQuery } from "../generated/graphql";

/**
 * GraphQL Code Generator scans for gql tags and generates types based on them.
 * The below query is used to generate the "useLastOrderQuery" hook.
 * If you modify it, make sure to run "pnpm codegen" to regenerate the types.
 */
gql`
  query LastOrder {
    orders(first: 1) {
      edges {
        node {
          id
          number
          created
          user {
            firstName
            lastName
          }
          shippingAddress {
            country {
              country
            }
          }
          total {
            gross {
              amount
              currency
            }
          }
          lines {
            id
          }
        }
      }
    }
  }
`;

function generateNumberOfLinesText(lines: any[]) {
  if (lines.length === 0) {
    return "no lines";
  }

  if (lines.length === 1) {
    return "1 line";
  }

  return `${lines.length} lines`;
}

export const OrderExample = () => {
  const { appBridge } = useAppBridge();

  // Using the generated hook
  const [{ data, fetching }] = useLastOrderQuery();
  const lastOrder = data?.orders?.edges[0]?.node;

  const navigateToOrder = (id: string) => {
    appBridge?.dispatch(
      actions.Redirect({
        to: `/orders/${id}`,
      })
    );
  };

  return (
    <Box display="flex" flexDirection={"column"} gap={2}>
      <Text as={"h2"} size={8}>
        Fetching data
      </Text>

      <>
        {fetching && <Text color="default2">Fetching the last order...</Text>}
        {lastOrder && (
          <>
            <Text color="default2">
              ❗ The <code>orders</code> query requires the <code>MANAGE_ORDERS</code> permission.
              If you want to query other resources, make sure to update the app permissions in the{" "}
              <code>/src/pages/api/manifest.ts</code> file.
            </Text>
            <Box
              backgroundColor={"default2"}
              padding={4}
              borderRadius={4}
              borderWidth={1}
              borderStyle={"solid"}
              borderColor={"default2"}
              marginY={4}
            >
              <Text>{`The last order #${lastOrder.number}:`}</Text>
              <ul>
                <li>
                  <Text>{`Contains ${generateNumberOfLinesText(lastOrder.lines)} 🛒`}</Text>
                </li>
                <li>
                  <Text>{`For a total amount of ${lastOrder.total.gross.amount} ${lastOrder.total.gross.currency} 💸`}</Text>
                </li>
                <li>
                  <Text>{`Ships to ${lastOrder.shippingAddress?.country.country} 📦`}</Text>
                </li>
              </ul>
              <Link onClick={() => navigateToOrder(lastOrder.id)} href={`/orders/${lastOrder.id}`}>
                See the order details →
              </Link>
            </Box>
          </>
        )}
        {!fetching && !lastOrder && <Text color="default2">No orders found</Text>}
      </>
    </Box>
  );
};
