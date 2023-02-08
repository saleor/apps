import { makeStyles } from "@saleor/macaw-ui";
import Image from "next/image";
import appIcon from "./AppIcon.svg";

const useStyles = makeStyles({
  appIconContainer: {
    background: `rgb(199, 58, 63)`,
    padding: 10,
    borderRadius: "50%",
    width: 50,
    height: 50,
  },
});

export const AppIcon = () => {
  const styles = useStyles();

  return (
    <div className={styles.appIconContainer}>
      <Image width={30} height={30} alt="icon" src={appIcon} />
    </div>
  );
};
