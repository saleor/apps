import { Box, Button } from "@saleor/macaw-ui/next";
import { Input } from "@saleor/react-hook-form-macaw";
import { RootConfig } from "../schemas/root-config.schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextLink } from "@saleor/apps-ui";
import { Text } from "@saleor/macaw-ui/next";
import { ButtonsBox } from "@/modules/ui/buttons-box";
import { trpcClient } from "@/modules/trpc/trpc-client";
import { Skeleton } from "@/modules/ui/skeleton";
import { useDashboardNotification } from "@saleor/apps-shared";

const Schema = RootConfig.Schema.unwrap();

type Shape = z.infer<typeof Schema>;

const SegmentConfigFormBase = (props: { values: Shape; onSubmit(values: Shape): void }) => {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(Schema),
    defaultValues: props.values,
  });

  return (
    <Box as="form" onSubmit={handleSubmit(props.onSubmit)}>
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
      <ButtonsBox marginTop={6}>
        <Button type="submit">Save</Button>
      </ButtonsBox>
    </Box>
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
    return <Skeleton.Section />;
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
