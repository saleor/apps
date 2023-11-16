import { NextPage } from "next";
import { Breadcrumbs } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import dynamic from "next/dynamic";

const DynamicCategoryMapping = dynamic(
  () => import("../modules/category-mapping/ui/category-mapping").then((m) => m.CategoryMapping),
  {
    loading: () => <Text>Loading...</Text>,
  }
);

const CategoriesPage: NextPage = () => {
  return (
    <Box data-testid="categories-mapping-container">
      <Breadcrumbs marginBottom={5}>
        <Breadcrumbs.Item href={"/"}>Configuration</Breadcrumbs.Item>
        <Breadcrumbs.Item>Categories Mapping</Breadcrumbs.Item>
      </Breadcrumbs>
      <DynamicCategoryMapping />
    </Box>
  );
};

export default CategoriesPage;
