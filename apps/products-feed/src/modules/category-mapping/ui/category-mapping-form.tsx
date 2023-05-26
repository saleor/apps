import { useForm } from "react-hook-form";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SetCategoryMappingInputSchema,
  SetCategoryMappingInputType,
} from "../category-mapping-input-schema";
import { CategoryWithMappingFragmentFragment } from "../../../../generated/graphql";
import { trpcClient } from "../../trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text } from "@saleor/macaw-ui/next";

type CategoryMappingFormProps = {
  category: CategoryWithMappingFragmentFragment;
};

export const CategoryMappingForm = ({ category }: CategoryMappingFormProps) => {
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

  const categoryBreadcrumbs = [category.parent?.parent?.name, category.parent?.name, category.name]
    .filter((segment) => segment)
    .join(" > ");

  return (
    <form
      onSubmit={handleSubmit((data, event) => {
        mutate(data);
      })}
    >
      <Text>{categoryBreadcrumbs}</Text>
      <Box>
        <Box>
          {/*<Controller*/}
          {/*  control={control}*/}
          {/*  name="googleCategoryId"*/}
          {/*  render={({ field: { value, onChange } }) => {*/}
          {/*    return (*/}
          {/*      <FormControl className={styles.field} fullWidth>*/}
          {/*        <InputLabel>Google Product Category</InputLabel>*/}
          {/*        <Select*/}
          {/*          variant="outlined"*/}
          {/*          value={value}*/}
          {/*          onChange={(event, val) => {*/}
          {/*            onChange(event.target.value);*/}
          {/*          }}*/}
          {/*        >*/}
          {/*          <MenuItem key="none" value={undefined}>*/}
          {/*            No configuration*/}
          {/*          </MenuItem>*/}
          {/*          {GoogleProductCategories.map((choice) => (*/}
          {/*            <MenuItem key={choice.id} value={choice.id.toString()}>*/}
          {/*              {choice.name}*/}
          {/*            </MenuItem>*/}
          {/*          ))}*/}
          {/*        </Select>*/}
          {/*      </FormControl>*/}
          {/*    );*/}
          {/*  }}*/}
          {/*/>*/}
        </Box>
        <Box>
          <Button type="submit" variant="primary" disabled={isLoading || !formState.isDirty}>
            Save
          </Button>
        </Box>
      </Box>
    </form>
  );
};
