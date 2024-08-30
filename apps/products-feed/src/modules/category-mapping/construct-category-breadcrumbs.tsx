import { Box, ChevronRightIcon, Text } from "@saleor/macaw-ui";

import { CategoryWithMappingFragmentFragment } from "../../../generated/graphql";

export const constructCategoryBreadcrumbs = (category: CategoryWithMappingFragmentFragment) =>
  [category.parent?.parent?.name, category.parent?.name, category.name].filter((segment) =>
    Boolean(segment),
  );

export const CategoryBreadcrumbs = (props: { category: CategoryWithMappingFragmentFragment }) => {
  const breadcrumbs = constructCategoryBreadcrumbs(props.category);

  return (
    <Box display={"flex"} marginBottom={1} data-testid={"category-breadcrumb"}>
      {breadcrumbs.map((category, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <Box display={"flex"} key={category}>
            <Text size={4} fontWeight={isLast ? "bold" : "regular"}>
              {category}
            </Text>
            {!isLast && <ChevronRightIcon />}
          </Box>
        );
      })}
    </Box>
  );
};
