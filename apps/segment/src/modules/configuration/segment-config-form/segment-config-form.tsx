import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Text } from "@saleor/macaw-ui";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ButtonsBox } from "@/components/ButtonsBox";
import { Input } from "@/components/Input";
import { Layout } from "@/components/Layout";
import { SkeletonLayout } from "@/components/SkeletonLayout";
import { TextLink } from "@/components/TextLink";
import { useDashboardNotification } from "@/lib/use-dashboard-notification";
import { trpcClient } from "@/modules/trpc/trpc-client";

import { RootConfig } from "../schemas/root-config.schema";

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
          <Text size={3} as="p" marginTop={2}>
            Read about write keys in{" "}
            <TextLink newTab size={5} href="https://segment.com/docs/connections/find-writekey/">
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
