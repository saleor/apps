import { makeStyles } from "@saleor/macaw-ui";
import { ReactNode } from "react";
import { Paper, PaperProps } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    height: 96,
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftColumn: {
    marginRight: "auto",
  },
  rightColumn: {},
  iconColumn: {
    marginRight: 24,
  },
  appName: { fontSize: 24, margin: 0 },
  appAuthor: {
    fontSize: 12,
    textTransform: "uppercase",
    color: theme.palette.text.secondary,
    fontWeight: 500,
    margin: 0,
  },
}));

type Props = {
  name: string;
  author: string;
  rightColumnContent?: ReactNode;
  icon?: ReactNode;
} & PaperProps;

export const MainBar = ({ name, author, rightColumnContent, className, icon }: Props) => {
  const styles = useStyles();

  return (
    <Paper elevation={0} className={clsx(styles.root, className)}>
      {icon && <div className={styles.iconColumn}>{icon}</div>}
      <div className={styles.leftColumn}>
        <h1 className={styles.appName}>{name}</h1>
        <h1 className={styles.appAuthor}>{author}</h1>
      </div>
      <div className={styles.rightColumn}>{rightColumnContent}</div>
    </Paper>
  );
};
