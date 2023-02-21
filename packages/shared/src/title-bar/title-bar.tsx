import { Paper, PaperProps } from "@material-ui/core";
import styles from "./title-bar.module.css";
import clsx from "clsx";
import { ReactNode } from "react";

const height = 96;

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
  return (
    <div
      className={clsx(styles.container, className, {
        [styles.bottomMargin]: bottomMargin,
      })}
    >
      <Paper variant="outlined" square elevation={0} className={styles.root}>
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
