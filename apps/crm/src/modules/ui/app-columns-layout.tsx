import { PropsWithChildren } from "react";

// todo rewrite to css modules or macaw
const rootStyles = {
  display: "grid",
  gridTemplateColumns: "280px auto 280px",
  alignItems: "start",
  gap: 32,
  margin: "0 auto",
  height: "100%",
};

type Props = PropsWithChildren<{}>;

export const AppColumnsLayout = ({ children }: Props) => {
  return <div style={rootStyles}>{children}</div>;
};
