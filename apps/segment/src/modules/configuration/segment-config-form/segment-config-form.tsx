import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared";
import { ButtonsBox, Layout, SkeletonLayout, TextLink } from "@saleor/apps-ui";
import { Button, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useForm } from "react-hook-form";

import { trpcClient } from "@/modules/trpc/trpc-client";

import { RootConfig } from "../schemas/root-config.schema";

const SegmentConfigFormBase = (props: {
  values: RootConfig.Shape;
  onSubmit(values: RootConfig.Shape): void;
}) => {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(RootConfig.Schema),
    defaultValues: props.values,
  });

  return (
    <Layout.AppSectionCard
      footer={
        <ButtonsBox>
          <Button type="submit">Save</Button>
        </ButtonsBox>
      }
      as="form"
      onSubmit={handleSubmit(props.onSubmit)}
    >
      <Input
        control={control}
        name="segmentWriteKey"
        type="password"
        label="Segment write key"
        required
        helperText={
          <Text>
            Read about write keys in{" "}
            <TextLink newTab href="https://segment.com/docs/connections/find-writekey/">
              Segment documentation
            </TextLink>
          </Text>
        }
      />
    </Layout.AppSectionCard>
  );
};

export const SegmentConfigForm = () => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { data: config, isLoading, refetch } = trpcClient.configuration.getConfig.useQuery();
  const utils = trpcClient.useUtils();

  const { mutate } = trpcClient.configuration.setOrCreateSegmentWriteKey.useMutation({
    onSuccess() {
      notifySuccess("Configuration saved");
      refetch();
      utils.configuration.getWebhookConfig.refetch();
    },
    onError() {
      notifyError("Error saving configuration");
    },
  });

  if (isLoading) {
    return <SkeletonLayout.Section />;
  }

  return (
    <SegmentConfigFormBase
      values={{ segmentWriteKey: config?.segmentWriteKey ?? "" }}
      onSubmit={(values) => {
        mutate(values.segmentWriteKey);
      }}
    />
  );
};
