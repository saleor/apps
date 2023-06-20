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
    label: "Providers",
    href: "/providers",
  },
];

const breadcrumbsForRoute: Record<string, Breadcrumb[]> = {
  "/": [],
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
  "/providers/taxjar/matcher": [
    ...newProviderBreadcrumbs,
    {
      label: "TaxJar",
      href: "/providers/taxjar",
    },
    {
      label: "Tax code matcher",
      href: "/providers/taxjar/matcher",
    },
  ],
  "/providers/taxjar/[id]": [
    ...newProviderBreadcrumbs,
    {
      label: "Editing TaxJar provider",
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
  "/providers/avatax/matcher": [
    ...newProviderBreadcrumbs,
    {
      label: "Avatax",
      href: "/providers/avatax",
    },
    {
      label: "Tax code matcher",
      href: "/providers/avatax/matcher",
    },
  ],
  "/providers/avatax/[id]": [
    ...newProviderBreadcrumbs,
    {
      label: "Editing Avatax provider",
      href: "/providers/avatax",
    },
  ],
};

const useBreadcrumbs = () => {
  const { pathname } = useRouter();
  const breadcrumbs = breadcrumbsForRoute[pathname];

  if (pathname !== "/" && pathname !== "_error" && !breadcrumbs) {
    throw new Error(`No breadcrumbs for route ${pathname}`);
  }

  return breadcrumbs;
};

export const AppBreadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs();

  return (
    <Breadcrumbs>
      {breadcrumbs.map((breadcrumb) => (
        <Breadcrumbs.Item key={breadcrumb.label} href={breadcrumb.href}>
          {breadcrumb.label}
        </Breadcrumbs.Item>
      ))}
    </Breadcrumbs>
  );
};
