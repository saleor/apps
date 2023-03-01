import { Link, makeStyles } from "@material-ui/core";
import { PropsWithChildren } from "react";
import { AppTab } from "../../pages/configuration";
import { useActiveTab } from "../taxes/tax-context";

const useStyles = makeStyles((theme) => ({
  button: {
    fontSize: "inherit",
    fontFamily: "inherit",
    verticalAlign: "unset",
  },
}));

export const AppTabNavButton = ({ children, to }: PropsWithChildren<{ to: AppTab }>) => {
  const styles = useStyles();
  const { setActiveTab } = useActiveTab();

  return (
    <Link className={styles.button} component="button" onClick={() => setActiveTab(to)}>
      {children}
    </Link>
  );
};
