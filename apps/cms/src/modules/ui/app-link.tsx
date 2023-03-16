import { Link } from "@material-ui/core";
import { PropsWithChildren } from "react";
import { useAppRedirect } from "../../lib/app/redirect";

export type AppLinkProps = {
  path?: string;
  href: string;
};

export const AppLink = ({ children, ...props }: PropsWithChildren<AppLinkProps>) => {
  const { redirect } = useAppRedirect();

  return (
    <Link target={"_blank"} href={props.href} rel="noreferrer" onClick={() => redirect(props)}>
      {children}
    </Link>
  );
};
