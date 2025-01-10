import { Box, Text } from "@saleor/macaw-ui";
import React from "react";

import { trpcClient } from "../../trpc/trpc-client";
import { CategoryMappingForm } from "./category-mapping-form";

export const CategoryMapping = () => {
  const { data: categories, isLoading } = trpcClient.categoryMapping.getCategoryMappings.useQuery();

  if (isLoading) {
    return <Text>Loading</Text>;
  }

  if (categories && categories.length === 0) {
    return <Text>No categories to map</Text>;
  }

  return (
    <Box>
      {categories!.map((category) => (
        <CategoryMappingForm category={category} key={category.id} marginBottom={5} />
      ))}
    </Box>
  );
};
