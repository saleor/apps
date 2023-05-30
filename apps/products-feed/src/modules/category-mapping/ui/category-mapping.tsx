import { trpcClient } from "../../trpc/trpc-client";

import React from "react";
import { CategoryMappingForm } from "./category-mapping-form";
import { Box, Text } from "@saleor/macaw-ui/next";

export const CategoryMapping = () => {
  const categories = trpcClient.categoryMapping.getCategoryMappings.useQuery();

  if (categories.isLoading) {
    return <Text>Loading</Text>;
  }

  if (categories?.data?.length === 0) {
    return <Text>No catagories to map</Text>;
  }

  return (
    <Box>
      {categories!.data!.map((category) => (
        <CategoryMappingForm category={category} key={category.id} marginBottom={8} />
      ))}
    </Box>
  );
};
