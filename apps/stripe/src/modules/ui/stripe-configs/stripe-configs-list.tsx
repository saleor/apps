import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Layout } from "@saleor/apps-ui";
import { Box, Button, Chip, Text, TrashBinIcon } from "@saleor/macaw-ui";
import { useRouter } from "next/router";

import {
  StripeFrontendConfig,
  StripeFrontendConfigSerializedFields,
} from "@/modules/app-config/domain/stripe-config";
import { trpcClient } from "@/modules/trpc/trpc-client";

type Props = {
  configs: Array<StripeFrontendConfigSerializedFields>;
};

export const StripeConfigsList = ({ configs, ...props }: Props) => {
  const router = useRouter();
  const { notifyError, notifySuccess } = useDashboardNotification();
  const configsList = trpcClient.appConfig.getStripeConfigsList.useQuery();
  const mappings = trpcClient.appConfig.channelsConfigsMapping.useQuery();
  const { mutate, isLoading } = trpcClient.appConfig.removeStripeConfig.useMutation({
    onSuccess() {
      notifySuccess("Configuration deleted");
    },
    onError(err) {
      notifyError("Error deleting config", err.message);
    },
    onSettled() {
      mappings.refetch();
      configsList.refetch();
    },
  });

  return (
    <Layout.AppSectionCard
      footer={
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={() => router.push("/config/new")}>Add Stripe configuration</Button>
        </Box>
      }
    >
      <Box {...props}>
        {configs.map((config) => {
          const configInstance = StripeFrontendConfig.createFromSerializedFields(config);
          const envValue = configInstance.getStripeEnvValue();

          const testEnvChip = (
            <Chip
              marginLeft={"auto"}
              backgroundColor="warning1"
              borderColor="warning1"
              color="warning1"
              size="large"
            >
              <Text color="warning1" size={1}>
                {configInstance.getStripeEnvValue()}
              </Text>
            </Chip>
          );
          const liveEnvChip = (
            <Chip
              marginLeft={"auto"}
              backgroundColor="success1"
              borderColor="success1"
              color="success1"
              size="large"
            >
              <Text color="accent1" size={1}>
                {configInstance.getStripeEnvValue()}
              </Text>
            </Chip>
          );

          return (
            <Box padding={4} key={configInstance.id}>
              <Box
                display={"flex"}
                justifyContent="space-between"
                width={"100%"}
                alignItems={"center"}
              >
                <Text marginRight={4} display="block">
                  {configInstance.name}
                </Text>
                {envValue === "TEST" ? testEnvChip : liveEnvChip}
                <Button
                  disabled={isLoading}
                  marginLeft={4}
                  display="block"
                  icon={<TrashBinIcon color="critical2" />}
                  variant="tertiary"
                  onClick={() => mutate({ configId: configInstance.id })}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Layout.AppSectionCard>
  );
};
