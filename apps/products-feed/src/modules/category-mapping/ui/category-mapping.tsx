import { trpcClient } from "../../trpc/trpc-client";
import { Paper } from "@material-ui/core";
import React from "react";
import { CategoryMappingForm } from "./category-mapping-form";

export const CategoryMapping = () => {
  const categories = trpcClient.categoryMapping.getCategoryMappings.useQuery();

  return (
    <Paper elevation={0}>
      {categories.data?.length
        ? categories.data.map((category) => (
            <CategoryMappingForm category={category} key={category.id} />
          ))
        : null}
    </Paper>
  );
};
