import { Box, Text, Button } from "@saleor/macaw-ui/next";
import { trpcClient } from "../../trpc/trpc-client";
import { PropsWithChildren } from "react";

const Wrapper = ({ children }: PropsWithChildren<{}>) => {
  return (
    <Box>
      <Box display={"flex"} justifyContent={"space-between"} marginBottom={8}>
        <Text variant={"heading"}>Default address of the shop</Text>
        <Button
          size={"small"}
          variant={"tertiary"}
          onClick={() => {
            throw new Error("Not implemented"); // todo
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
        <Text marginBottom={4} color={"textCriticalDefault"}>
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
        <Text as={"p"} size={"small"} marginBottom={4}>
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
        <Text>{data.companyAddress.streetAddress1}</Text>
      </Wrapper>
    );
  }

  return null;
};
