import { TitleTemplateInput, titleTemplateInputSchema } from "./app-config";
import { useForm } from "react-hook-form";

import { Box, Button, Text } from "@saleor/macaw-ui";

import React, { useCallback, useMemo, useState } from "react";
import { Input } from "@saleor/react-hook-form-macaw";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpcClient } from "../trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared";

type Props = {
  initialData: TitleTemplateInput;
  preview: string | undefined;
  onSubmit(data: TitleTemplateInput): Promise<void>;
  onPreview(data: TitleTemplateInput): Promise<void>;
};

export const TitleFormattingConfigurationForm = (props: Props) => {
  const { handleSubmit, control, getValues } = useForm<TitleTemplateInput>({
    defaultValues: props.initialData,
    resolver: zodResolver(titleTemplateInputSchema),
  });

  return (
    <Box
      as={"form"}
      display={"flex"}
      gap={5}
      flexDirection={"column"}
      onSubmit={handleSubmit((data) => {
        props.onSubmit(data);
      })}
    >
      <Input control={control} name="titleTemplate" label="Title template" />
      {props.preview?.length && <Text variant="caption">{props.preview}</Text>}
      <Box display={"flex"} flexDirection={"row"} gap={4} justifyContent={"flex-end"}>
        <Button
          variant="secondary"
          onClick={() => {
            props.onPreview(getValues());
          }}
        >
          Preview
        </Button>
        <Button type="submit" variant="primary">
          Save
        </Button>
      </Box>
    </Box>
  );
};

export const ConnectedTitleFormattingForm = () => {
  const { notifyError, notifySuccess } = useDashboardNotification();
  const [preview, setPreview] = useState<string | undefined>();

  const { data, isLoading } = trpcClient.appConfiguration.fetch.useQuery();

  const { mutate } = trpcClient.appConfiguration.setTitleTemplate.useMutation({
    onSuccess() {
      notifySuccess("Success", "Updated title template");
    },
    onError() {
      notifyError("Error", "Failed to update, please refresh and try again");
    },
  });

  const { mutate: previewMutate } = trpcClient.appConfiguration.renderTemplate.useMutation({
    onSuccess(data) {
      setPreview(data.title);
    },
    onError() {
      notifyError("Error", "Template invalid");
    },
  });

  const handleSubmit = useCallback(
    async (data: TitleTemplateInput) => {
      mutate(data);
    },
    [mutate],
  );

  const handlePreview = useCallback(
    async (data: TitleTemplateInput) => {
      previewMutate(data);
    },
    [previewMutate],
  );

  const formData: TitleTemplateInput = useMemo(() => {
    if (data?.titleTemplate) {
      return {
        titleTemplate: data.titleTemplate,
      };
    }

    return titleTemplateInputSchema.parse({});
  }, [data]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      {!isLoading ? (
        <TitleFormattingConfigurationForm
          onSubmit={handleSubmit}
          initialData={formData}
          onPreview={handlePreview}
          preview={preview}
        />
      ) : (
        <Box>Loading</Box>
      )}
    </>
  );
};
