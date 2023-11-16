import { Box, Button, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import React from "react";
import { ProvidersConfig } from "../configuration";

import { ProvidersResolver } from "../providers/providers-resolver";
import { trpcClient } from "../trpc/trpc-client";

import { ButtonsBox, Layout, SkeletonLayout } from "@saleor/apps-ui";

const ProvidersTable = (props: { providers: ProvidersConfig.AnyFullShape[] }) => {
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
              {ProvidersResolver.createProviderMeta(provider.type).displayName}
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
    return <SkeletonLayout.Section />;
  }

  if (data.length === 0) {
    return (
      <Layout.AppSectionCard
        footer={
          <ButtonsBox>
            <Button
              onClick={() => {
                push("/add-provider");
              }}
            >
              Add first CMS configuration
            </Button>
          </ButtonsBox>
        }
      >
        <Text as="p" marginBottom={4}>
          No configurations yet
        </Text>
      </Layout.AppSectionCard>
    );
  }

  return (
    <Layout.AppSectionCard
      footer={
        <ButtonsBox>
          <Button
            onClick={() => {
              push("/add-provider");
            }}
          >
            Add CMS configuration
          </Button>
        </ButtonsBox>
      }
    >
      {data.length && (
        <Box>
          <Text variant="heading" as="h2" marginBottom={4}>
            Providers configurations
          </Text>
          <ProvidersTable providers={data} />
        </Box>
      )}
    </Layout.AppSectionCard>
  );
};
