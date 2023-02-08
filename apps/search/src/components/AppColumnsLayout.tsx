import { makeStyles } from "@saleor/macaw-ui";
import { PropsWithChildren } from "react";

const useStyles = makeStyles({
  root3equal: {
    display: "grid",
    gridTemplateColumns: "280px auto 280px",
    alignItems: "start",
    gap: 32,
    maxWidth: 1180,
    margin: "0 auto",
  },
  oneTo2: {
    display: "grid",
    gridTemplateColumns: "460px 1fr",
    alignItems: "start",
    gap: 32,
    maxWidth: 1180,
    margin: "0 auto",
  },
});

type Props = PropsWithChildren<{
  variant?: "3-equal" | "1:2";
}>;

/**
 * TODO Refactor, make generic across the apps
 */
export const AppColumnsLayout = ({ children, variant = "3-equal" }: Props) => {
  const styles = useStyles();

  switch (variant) {
    case "1:2":
      return <div className={styles.oneTo2}>{children}</div>;
    case "3-equal":
      return <div className={styles.root3equal}>{children}</div>;
    default:
      throw new Error("Invalid variant");
  }
};
