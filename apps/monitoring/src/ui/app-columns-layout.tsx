import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{}>;

export function AppColumnsLayout({ children }: Props) {
  return <div>{children}</div>;
}
