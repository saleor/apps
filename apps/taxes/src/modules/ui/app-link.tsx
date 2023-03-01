import { Link } from "@material-ui/core";
import { PropsWithChildren } from "react";
import { useAppRedirect } from "../../lib/app/redirect";

export const AppLink = ({ children, href }: PropsWithChildren<{ href: string }>) => {
  const { redirect } = useAppRedirect();

  return (
    <Link target={"_blank"} href={href} rel="noreferrer" onClick={() => redirect(href)}>
      {children}
    </Link>
  );
};
