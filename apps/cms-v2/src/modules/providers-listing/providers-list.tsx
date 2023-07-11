import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import React from "react";
import { AnyProviderConfigSchemaType } from "../configuration";
import { createProvider } from "../shared/cms-provider";
import { trpcClient } from "../trpc/trpc-client";
import { ButtonsBox } from "../ui/buttons-box";

const ProvidersTable = (props: { providers: AnyProviderConfigSchemaType[] }) => {
  const { push } = useRouter();

  return (
    <Box display="grid" __gridTemplateColumns="repeat(2, auto)" gap={4} alignItems="center">
      <Text variant="caption">Configuration name</Text>

      <div />

      {props.providers.map((provider) => (
        <React.Fragment key={provider.id}>
          <Box>
            <Text as="p" variant="bodyStrong">
              {provider.configName}
            </Text>
            <Text as="p" variant="caption">
              {createProvider(provider.type).displayName}
            </Text>
          </Box>
          <Button
            marginLeft="auto"
            variant="tertiary"
            onClick={() => {
              push(`/edit-provider/` + provider.id);
            }}
          >
            Edit
          </Button>
        </React.Fragment>
      ))}
    </Box>
  );
};

export const ProvidersList = () => {
  const { data } = trpcClient.providersConfigs.getAll.useQuery();
  const { push } = useRouter();

  if (!data) {
    return null;
  }

  if (data.length === 0) {
    return (
      <Box>
        <Text as="p" marginBottom={4}>
          No configurations yet
        </Text>
        <ButtonsBox>
          <Button
            onClick={() => {
              push("/add-provider");
            }}
          >
            Add first CMS configuration
          </Button>
        </ButtonsBox>
      </Box>
    );
  }

  return (
    <Box>
      {data.length && (
        <Box>
          <Text variant="heading" as="h2" marginBottom={4}>
            Providers configurations
          </Text>
          <ProvidersTable providers={data} />
        </Box>
      )}
      <ButtonsBox marginTop={8}>
        <Button
          onClick={() => {
            push("/add-provider");
          }}
        >
          Add CMS configuration
        </Button>
      </ButtonsBox>
    </Box>
  );
};
