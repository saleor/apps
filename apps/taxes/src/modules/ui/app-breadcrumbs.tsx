import { Breadcrumbs } from "@saleor/apps-ui";
import { useRouter } from "next/router";

type Breadcrumb = {
  label: string;
  href?: string;
};

const newProviderBreadcrumbs = [
  {
    href: "/configuration",
    label: "Configuration",
  },
  {
    label: "Add provider",
    href: "/providers",
  },
] as Breadcrumb[];

const breadcrumbsForRoute = {
  "/configuration": [
    {
      href: "/configuration",
      label: "Configuration",
    },
  ],
  "/providers": [...newProviderBreadcrumbs],
  "/providers/taxjar": [
    ...newProviderBreadcrumbs,
    {
      label: "TaxJar",
      href: "/providers/taxjar",
    },
  ],
  "/providers/avatax": [
    ...newProviderBreadcrumbs,
    {
      label: "Avatax",
      href: "/providers/avatax",
    },
  ],
} as Record<string, Breadcrumb[]>;

const useBreadcrumbs = () => {
  const router = useRouter();
  const breadcrumbs = breadcrumbsForRoute[router.pathname];

  return breadcrumbs;
};

export const AppBreadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs();

  return (
    <Breadcrumbs>
      {breadcrumbs?.map((breadcrumb) => (
        <Breadcrumbs.Item href={breadcrumb.href}>{breadcrumb.label}</Breadcrumbs.Item>
      ))}
    </Breadcrumbs>
  );
};
