import { Breadcrumbs } from "@saleor/apps-ui";
import { Box } from "@saleor/macaw-ui/next";

interface BasicLayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
  breadcrumbs?: { name: string; href?: string }[];
}

export const BasicLayout = ({ children, breadcrumbs, isLoading = false }: BasicLayoutProps) => {
  return (
    <Box padding={10} display="grid" gap={13}>
      {breadcrumbs?.length && (
        <Breadcrumbs>
          {breadcrumbs.map((breadcrumb) => (
            <Breadcrumbs.Item href={breadcrumb.href}>{breadcrumb.name}</Breadcrumbs.Item>
          ))}
        </Breadcrumbs>
      )}
      {children}
    </Box>
  );
};
