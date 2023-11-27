import { Controller, useForm } from "react-hook-form";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SetCategoryMappingInputSchema,
  SetCategoryMappingInputType,
} from "../category-mapping-input-schema";
import { CategoryWithMappingFragmentFragment } from "../../../../generated/graphql";
import { trpcClient } from "../../trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, PropsWithBox } from "@saleor/macaw-ui";
import { GoogleProductCategories } from "../google-product-categories";
import { CategoryBreadcrumbs } from "../construct-category-breadcrumbs";

type CategoryMappingFormProps = {
  category: CategoryWithMappingFragmentFragment;
};

/**
 * Use Combobox, when virtualized. For such amount of data it almost crashes app due to slow rendering
 * https://github.com/saleor/macaw-ui/issues/452
 */
export const CategoryMappingForm = ({
  category,
  ...props
}: PropsWithBox<CategoryMappingFormProps>) => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { control, handleSubmit, formState } = useForm<SetCategoryMappingInputType>({
    defaultValues: {
      categoryId: category.id,
      googleCategoryId: category.googleCategoryId || undefined,
    },
    resolver: zodResolver(SetCategoryMappingInputSchema),
  });
  const { mutate, isLoading } = trpcClient.categoryMapping.setCategoryMapping.useMutation({
    onError() {
      notifyError("Could not save the category mapping");
    },
    onSuccess() {
      notifySuccess("Success");
    },
  });

  return (
    <Box
      as={"form"}
      {...props}
      onSubmit={handleSubmit((data, event) => {
        mutate(data);
      })}
    >
      <CategoryBreadcrumbs category={category} />
      <Box display={"flex"} gap={5} __width={"100%"}>
        <Controller
          control={control}
          name="googleCategoryId"
          render={({ field: { value, onChange } }) => {
            return (
              <select
                data-testid={"google-category-select"}
                style={{ width: "100%" }}
                value={value}
                onChange={(event) => {
                  onChange(event.target.value);
                }}
              >
                <option value={undefined}>No override</option>
                {GoogleProductCategories.map((choice) => (
                  <option key={choice.id} value={choice.id.toString()}>
                    {choice.name}
                  </option>
                ))}
              </select>
            );
          }}
        />
        <Button
          data-testid={"google-category-submit"}
          type="submit"
          variant="primary"
          disabled={isLoading || !formState.isDirty}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};
