import { Link, makeStyles } from "@material-ui/core";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";
import { AppTab } from "./app-tabs";

const useStyles = makeStyles((theme) => ({
  button: {
    fontSize: "inherit",
    fontFamily: "inherit",
    verticalAlign: "unset",
  },
}));

export const AppTabNavButton = ({ children, to }: PropsWithChildren<{ to: AppTab }>) => {
  const styles = useStyles();
  const router = useRouter();

  return (
    <Link className={styles.button} component="button" onClick={() => router.push(to)}>
      {children}
    </Link>
  );
};
