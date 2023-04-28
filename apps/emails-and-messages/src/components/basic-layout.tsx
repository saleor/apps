import { Box } from "@saleor/macaw-ui/next";
import { Breadcrumbs } from "./breadcrumbs";

interface BasicLayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
  breadcrumbs?: { name: string; href?: string }[];
}

export const BasicLayout = ({ children, breadcrumbs, isLoading = false }: BasicLayoutProps) => {
  return (
    <Box padding={10} display={"grid"} gap={13}>
      {breadcrumbs?.length && <Breadcrumbs items={breadcrumbs} />}
      {children}
    </Box>
  );
};
