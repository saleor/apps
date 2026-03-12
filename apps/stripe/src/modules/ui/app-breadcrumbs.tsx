import { Breadcrumbs } from "@saleor/apps-ui";
import { type PropsWithBox } from "@saleor/macaw-ui";

export type Breadcrumb = {
  label: string;
  href?: string;
};

type Props = PropsWithBox<{
  breadcrumbs: Breadcrumb[];
}>;

export const AppBreadcrumbs = ({ breadcrumbs, ...props }: Props) => {
  return (
    <Breadcrumbs {...props}>
      {breadcrumbs.map((breadcrumb) => (
        <Breadcrumbs.Item key={breadcrumb.label} href={breadcrumb.href}>
          {breadcrumb.label}
        </Breadcrumbs.Item>
      ))}
    </Breadcrumbs>
  );
};
