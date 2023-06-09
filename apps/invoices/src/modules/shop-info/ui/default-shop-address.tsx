import { Box, Text, Button } from "@saleor/macaw-ui/next";
import { trpcClient } from "../../trpc/trpc-client";
import { PropsWithChildren } from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";

const Wrapper = ({ children }: PropsWithChildren<{}>) => {
  const { appBridge } = useAppBridge();

  return (
    <Box>
      <Box display={"flex"} justifyContent={"space-between"} marginBottom={5}>
        <Text variant={"heading"}>Default address of the shop</Text>
        <Button
          size={"small"}
          variant={"tertiary"}
          onClick={() => {
            appBridge?.dispatch(
              actions.Redirect({
                to: "/site-settings",
              })
            );
          }}
        >
          <Text color={"textNeutralSubdued"}>Edit</Text>
        </Button>
      </Box>
      <Box>{children}</Box>
    </Box>
  );
};

export const DefaultShopAddress = () => {
  const { data, isLoading, error, refetch } = trpcClient.shopInfo.fetchShopAddress.useQuery();

  if (error) {
    return (
      <Wrapper>
        <Text marginBottom={1.5} color={"textCriticalDefault"}>
          Error while fetching shop address
        </Text>
        <Button onClick={() => refetch()}>Fetch again</Button>
      </Wrapper>
    );
  }

  if (isLoading) {
    return (
      <Wrapper>
        <Text color={"textNeutralSubdued"}>Loading...</Text>
      </Wrapper>
    );
  }

  if (data && data.companyAddress === null) {
    return (
      <Wrapper>
        <Text as={"p"} variant={"bodyStrong"}>
          No default address set
        </Text>
        <Text as={"p"} size={"small"} marginBottom={1.5}>
          Set default shop address or channel overrides
        </Text>
        <Text as={"p"} color={"textCriticalDefault"}>
          If no address is set, invoices will not be generated
        </Text>
      </Wrapper>
    );
  }

  if (data && data.companyAddress) {
    return (
      <Wrapper>
        <Text size={"small"} as={"p"}>
          {data.companyAddress.companyName}
        </Text>
        <Text size={"small"} as={"p"}>
          {data.companyAddress.streetAddress1}
        </Text>
        <Text size={"small"} as={"p"}>
          {data.companyAddress.streetAddress2}
        </Text>
        <Text size={"small"}>
          {data.companyAddress.postalCode} {data.companyAddress.city}
        </Text>
        <Text size={"small"} as={"p"}>
          {data.companyAddress.country.country}
        </Text>
      </Wrapper>
    );
  }

  return null;
};
