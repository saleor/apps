import React from "react";
import { AppBreadcrumbs, Breadcrumb } from "./app-breadcrumbs";
import { AppColumns } from "./app-columns";

export const AppPageLayout = ({
  top,
  children,
  breadcrumbs,
}: {
  top: React.ReactNode;
  children: React.ReactNode;
  breadcrumbs: Breadcrumb[];
}) => {
  return (
    <>
      <AppBreadcrumbs breadcrumbs={breadcrumbs} />
      <AppColumns top={top}>{children}</AppColumns>
    </>
  );
};
