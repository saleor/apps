import { Breadcrumbs } from "@saleor/apps-ui";
import { useRouter } from "next/router";

type Breadcrumb = {
  label: string;
  href?: string;
};

const newProviderBreadcrumbs: Breadcrumb[] = [
  {
    href: "/configuration",
    label: "Configuration",
  },
  {
    label: "Add provider",
    href: "/providers",
  },
];

const breadcrumbsForRoute: Record<string, Breadcrumb[]> = {
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
};

const useBreadcrumbs = () => {
  const router = useRouter();
  const breadcrumbs = breadcrumbsForRoute[router.pathname];

  if (!breadcrumbs) {
    throw new Error(`No breadcrumbs for route ${router.pathname}`);
  }

  return breadcrumbs;
};

export const AppBreadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs();

  return (
    <Breadcrumbs>
      {breadcrumbs.map((breadcrumb) => (
        <Breadcrumbs.Item href={breadcrumb.href}>{breadcrumb.label}</Breadcrumbs.Item>
      ))}
    </Breadcrumbs>
  );
};
