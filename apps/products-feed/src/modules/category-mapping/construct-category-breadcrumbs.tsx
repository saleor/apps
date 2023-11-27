import { CategoryWithMappingFragmentFragment } from "../../../generated/graphql";
import React from "react";
import { Box, ChevronRightIcon, Text } from "@saleor/macaw-ui";

export const constructCategoryBreadcrumbs = (category: CategoryWithMappingFragmentFragment) =>
  [category.parent?.parent?.name, category.parent?.name, category.name].filter((segment) =>
    Boolean(segment)
  );

export const CategoryBreadcrumbs = (props: { category: CategoryWithMappingFragmentFragment }) => {
  const breadcrumbs = constructCategoryBreadcrumbs(props.category);

  return (
    <Box display={"flex"} marginBottom={1} data-testid={"category-breadcrumb"}>
      {breadcrumbs.map((category, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <Box display={"flex"} key={category}>
            <Text variant={isLast ? "bodyStrong" : "body"}>{category}</Text>
            {!isLast && <ChevronRightIcon />}
          </Box>
        );
      })}
    </Box>
  );
};
