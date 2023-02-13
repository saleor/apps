import { Paper, PaperProps } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";
import clsx from "clsx";
import { ReactNode } from "react";

const height = 96;

const useStyles = makeStyles((theme) => ({
  container: {
    position: "relative",
    height: height,
  },
  root: {
    zIndex: 300,
    position: "fixed",
    left: 0,
    right: 0,
    top: 0,
    height: height,
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid ${theme.palette.grey.A100} `,
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
  bottomMargin: {
    marginBottom: 32,
  },
}));

type Props = {
  name: string;
  author: string;
  rightColumnContent?: ReactNode;
  icon?: ReactNode;
  bottomMargin?: boolean;
} & PaperProps;

export function TitleBar({
  name,
  author,
  rightColumnContent,
  className,
  icon,
  bottomMargin,
}: Props) {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Paper
        square
        elevation={0}
        className={clsx(styles.root, className, {
          [styles.bottomMargin]: bottomMargin,
        })}
      >
        {icon && <div className={styles.iconColumn}>{icon}</div>}
        <div className={styles.leftColumn}>
          <h1 className={styles.appName}>{name}</h1>
          <h1 className={styles.appAuthor}>{author}</h1>
        </div>
        <div className={styles.rightColumn}>{rightColumnContent}</div>
      </Paper>
    </div>
  );
}

TitleBar.height = height;
