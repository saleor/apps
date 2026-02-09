import { Breadcrumbs } from "@saleor/apps-ui";
import { Box } from "@saleor/macaw-ui";

interface BasicLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: { name: string; href?: string }[];
}

export const BasicLayout = ({ children, breadcrumbs }: BasicLayoutProps) => {
  return (
    <Box padding={7} display="grid" gap={10} backgroundColor="default1">
      {breadcrumbs?.length && (
        <Breadcrumbs>
          {breadcrumbs.map((breadcrumb) => (
            <Breadcrumbs.Item key={breadcrumb.name} href={breadcrumb.href}>
              {breadcrumb.name}
            </Breadcrumbs.Item>
          ))}
        </Breadcrumbs>
      )}
      {children}
    </Box>
  );
};
