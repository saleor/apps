import { NextPage } from "next";
import { CategoryMapping } from "../modules/category-mapping/ui/category-mapping";
import { Breadcrumbs } from "@saleor/apps-ui";
import { Box } from "@saleor/macaw-ui/next";

const CategoriesPage: NextPage = () => {
  return (
    <Box>
      <Breadcrumbs marginBottom={5}>
        <Breadcrumbs.Item href={"/"}>Configuration</Breadcrumbs.Item>
        <Breadcrumbs.Item>Categories Mapping</Breadcrumbs.Item>
      </Breadcrumbs>
      <CategoryMapping />
    </Box>
  );
};

export default CategoriesPage;
