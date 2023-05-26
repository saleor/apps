import { trpcClient } from "../../trpc/trpc-client";

import React from "react";
import { CategoryMappingForm } from "./category-mapping-form";
import { Box } from "@saleor/macaw-ui/next";

export const CategoryMapping = () => {
  const categories = trpcClient.categoryMapping.getCategoryMappings.useQuery();

  return (
    <Box>
      {categories.data?.length
        ? categories.data.map((category) => (
            <CategoryMappingForm category={category} key={category.id} />
          ))
        : null}
    </Box>
  );
};
