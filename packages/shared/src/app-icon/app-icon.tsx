import { Typography } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";
import { HTMLProps } from "react";
import clsx from "clsx";

const useStyles = makeStyles({
  appIconContainer: {
    background: "rgb(58, 86, 199)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    color: "#fff",
    width: 50,
    height: 50,
  },
});

type Props = HTMLProps<HTMLDivElement>;

export function AppIcon({ className, children, ...props }: Props) {
  const styles = useStyles();

  return (
    <div className={clsx(styles.appIconContainer, className)} {...props}>
      <div>
        <Typography variant="h2">{children}</Typography>
      </div>
    </div>
  );
}
