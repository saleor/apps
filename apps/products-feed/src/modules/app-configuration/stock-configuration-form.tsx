import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Select } from "@saleor/react-hook-form-macaw";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";

import { trpcClient } from "../trpc/trpc-client";
import { type OutOfStockBehaviorInput, outOfStockBehaviorInputSchema } from "./app-config";

type Props = {
  initialData: OutOfStockBehaviorInput;
  onSubmit(data: OutOfStockBehaviorInput): Promise<void>;
};

const outOfStockBehaviorOptions = [
  { value: "markOutOfStock", label: "Include, marked as out of stock" },
  { value: "exclude", label: "Exclude from the feed" },
];

export const StockConfigurationForm = (props: Props) => {
  const { handleSubmit, control } = useForm<OutOfStockBehaviorInput>({
    defaultValues: props.initialData,
    resolver: zodResolver(outOfStockBehaviorInputSchema),
  });

  return (
    <Box
      as={"form"}
      display={"flex"}
      gap={5}
      flexDirection={"column"}
      onSubmit={handleSubmit(props.onSubmit)}
    >
      <Select
        control={control}
        name="outOfStockBehavior"
        label="Products with no stock available"
        options={outOfStockBehaviorOptions}
      />
      <Box display={"flex"} flexDirection={"row"} gap={4} justifyContent={"flex-end"}>
        <Button type="submit" variant="primary">
          Save
        </Button>
      </Box>
    </Box>
  );
};

export const ConnectedStockConfigurationForm = () => {
  const { notifyError, notifySuccess } = useDashboardNotification();

  const { data, isLoading } = trpcClient.appConfiguration.fetch.useQuery();

  const { mutate } = trpcClient.appConfiguration.setOutOfStockBehavior.useMutation({
    onSuccess() {
      notifySuccess("Success", "Updated out of stock behavior");
    },
    onError() {
      notifyError("Error", "Failed to update, please refresh and try again");
    },
  });

  const handleSubmit = useCallback(
    async (data: OutOfStockBehaviorInput) => {
      mutate(data);
    },
    [mutate],
  );

  const formData: OutOfStockBehaviorInput = useMemo(
    () => outOfStockBehaviorInputSchema.parse({ outOfStockBehavior: data?.outOfStockBehavior }),
    [data],
  );

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return <StockConfigurationForm onSubmit={handleSubmit} initialData={formData} />;
};
