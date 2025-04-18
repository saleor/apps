import { Layout } from "@saleor/apps-ui";
import { Box, Button, ChevronRightIcon, Chip, List, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";

import {
  StripeFrontendConfig,
  StripeFrontendConfigSerializedFields,
} from "@/modules/app-config/stripe-config";

type Props = {
  configs: Array<StripeFrontendConfigSerializedFields>;
};

export const StripeConfigsList = ({ configs, ...props }: Props) => {
  const router = useRouter();

  return (
    <Layout.AppSectionCard
      footer={
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={() => router.push("/config/new")}>Add Stripe configuration</Button>
        </Box>
      }
    >
      <List {...props}>
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
              <Text color="success1" size={1}>
                {configInstance.getStripeEnvValue()}
              </Text>
            </Chip>
          );

          return (
            <List.Item padding={4} key={configInstance.id}>
              <Box display={"flex"} justifyContent="space-between" width={"100%"}>
                <Text marginRight={4} display="block">
                  {configInstance.name}
                </Text>
                {envValue === "TEST" ? testEnvChip : liveEnvChip}
                <Text marginLeft={4} display="block">
                  <ChevronRightIcon />
                </Text>
              </Box>
            </List.Item>
          );
        })}
      </List>
    </Layout.AppSectionCard>
  );
};
