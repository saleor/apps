import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Select } from "@saleor/react-hook-form-macaw";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";

import { trpcClient } from "../trpc/trpc-client";
import { ImageSizeInput, imageSizeInputSchema } from "./app-config";

type Props = {
  initialData: ImageSizeInput;
  onSubmit(data: ImageSizeInput): Promise<void>;
};

const imageSizeOptions = [
  { value: "256", label: "256px" },
  { value: "512", label: "512px" },
  { value: "1024", label: "1024px" },
  { value: "2048", label: "2048px" },
  { value: "4096", label: "4096px" },
];

export const ImageConfigurationForm = (props: Props) => {
  const { handleSubmit, control, formState } = useForm<ImageSizeInput>({
    defaultValues: props.initialData,
    resolver: zodResolver(imageSizeInputSchema),
  });

  return (
    <Box
      as={"form"}
      display={"flex"}
      gap={5}
      flexDirection={"column"}
      onSubmit={handleSubmit(props.onSubmit)}
    >
      <Select control={control} name="imageSize" label="Image size" options={imageSizeOptions} />
      {!!formState.errors.imageSize?.message && (
        <Text size={2} color={"default2"}>
          {formState.errors.imageSize?.message}
        </Text>
      )}
      <Box display={"flex"} flexDirection={"row"} gap={4} justifyContent={"flex-end"}>
        <Button type="submit" variant="primary">
          Save
        </Button>
      </Box>
    </Box>
  );
};

export const ConnectedImageConfigurationForm = () => {
  const { notifyError, notifySuccess } = useDashboardNotification();

  const { data, isLoading } = trpcClient.appConfiguration.fetch.useQuery();

  const { mutate } = trpcClient.appConfiguration.setImageSize.useMutation({
    onSuccess() {
      notifySuccess("Success", "Updated image size");
    },
    onError() {
      notifyError("Error", "Failed to update, please refresh and try again");
    },
  });

  const handleSubmit = useCallback(
    async (data: ImageSizeInput) => {
      mutate(data);
    },
    [mutate],
  );

  const formData: ImageSizeInput = useMemo(() => {
    if (data?.imageSize) {
      return {
        imageSize: data.imageSize,
      };
    }

    return imageSizeInputSchema.parse({});
  }, [data]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      {!isLoading ? (
        <ImageConfigurationForm onSubmit={handleSubmit} initialData={formData} />
      ) : (
        <Box>Loading</Box>
      )}
    </>
  );
};
