import { Controller, useForm } from "react-hook-form";
import { FormControl, Grid, InputLabel, MenuItem, Select, Typography } from "@material-ui/core";
import { Button, makeStyles } from "@saleor/macaw-ui";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SetCategoryMappingInputSchema,
  SetCategoryMappingInputType,
} from "../category-mapping-input-schema";
import { CategoryWithMappingFragmentFragment } from "../../../../generated/graphql";
import { GoogleProductCategories } from "../google-product-categories";
import { trpcClient } from "../../trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared";

const useStyles = makeStyles({
  field: {
    marginBottom: 20,
  },
  form: {
    padding: 20,
  },
  channelName: {
    fontFamily: "monospace",
    cursor: "pointer",
  },
});

type CategoryMappingFormProps = {
  category: CategoryWithMappingFragmentFragment;
};

export const CategoryMappingForm = ({ category }: CategoryMappingFormProps) => {
  const styles = useStyles();
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
      className={styles.form}
    >
      <Typography variant="h4" paragraph>
        {categoryBreadcrumbs}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={10}>
          <Controller
            control={control}
            name="googleCategoryId"
            render={({ field: { value, onChange } }) => {
              return (
                <FormControl className={styles.field} fullWidth>
                  <InputLabel>Google Product Category</InputLabel>
                  <Select
                    variant="outlined"
                    value={value}
                    onChange={(event, val) => {
                      onChange(event.target.value);
                    }}
                  >
                    <MenuItem key="none" value={undefined}>
                      No configuration
                    </MenuItem>
                    {GoogleProductCategories.map((choice) => (
                      <MenuItem key={choice.id} value={choice.id.toString()}>
                        {choice.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            }}
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            type="submit"
            fullWidth
            variant="primary"
            disabled={isLoading || !formState.isDirty}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};
