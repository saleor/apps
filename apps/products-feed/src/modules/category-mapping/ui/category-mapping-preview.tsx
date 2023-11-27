import { Box, Text } from "@saleor/macaw-ui";
import { trpcClient } from "../../trpc/trpc-client";
import { CategoryBreadcrumbs } from "../construct-category-breadcrumbs";
import { GoogleProductCategories } from "../google-product-categories";
import { useMemo } from "react";

const GoogleCategory = (props: { categoryId: string }) => {
  const googleCategory = useMemo(() => {
    return GoogleProductCategories.find((cat) => cat.id === props.categoryId);
  }, [props.categoryId]);

  return <Text size={"small"}>{googleCategory?.name}</Text>;
};

export const CategoryMappingPreview = () => {
  const { data: categories, isLoading } = trpcClient.categoryMapping.getCategoryMappings.useQuery();

  if (isLoading) {
    return <Text>Loading</Text>;
  }

  if (categories?.length === 0) {
    return <Text>No categories</Text>;
  }

  return (
    <Box>
      <Text marginBottom={5} as={"h2"} variant={"heading"}>
        Mapped categories
      </Text>
      {categories!
        .filter((c) => c.googleCategoryId)
        .map((category) => {
          return (
            <Box
              key={category.id}
              marginBottom={1.5}
              borderBottomStyle={"solid"}
              borderColor={"neutralHighlight"}
              borderWidth={1}
              paddingBottom={1.5}
            >
              <CategoryBreadcrumbs category={category} />
              <GoogleCategory categoryId={category.googleCategoryId!} />
            </Box>
          );
        })}
    </Box>
  );
};
