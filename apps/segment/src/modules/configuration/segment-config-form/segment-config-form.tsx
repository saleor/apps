import { Box, Button } from "@saleor/macaw-ui";
import { Input } from "@/components/Input";
import { RootConfig } from "../schemas/root-config.schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextLink } from "@/components/TextLink";
import { ButtonsBox } from '@/components/ButtonsBox'
import { Layout } from '@/components/Layout'
import { SkeletonLayout } from '@/components/SkeletonLayout'
import { Text } from "@saleor/macaw-ui";
import { trpcClient } from "@/modules/trpc/trpc-client";
import { useDashboardNotification } from "@/lib/use-dashboard-notification";

const Schema = RootConfig.Schema.unwrap();

type Shape = z.infer<typeof Schema>;

const SegmentConfigFormBase = (props: { values: Shape; onSubmit(values: Shape): void }) => {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(Schema),
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
        helperText={
          <Text variant="caption" as="p" marginTop={2}>
            Read about write keys in{" "}
            <TextLink
              newTab
              size="small"
              href="https://segment.com/docs/connections/find-writekey/"
            >
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
  const { mutate } = trpcClient.configuration.setConfig.useMutation({
    onSuccess() {
      notifySuccess("Configuration saved");
      refetch();
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
