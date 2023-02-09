import { makeStyles } from "@saleor/macaw-ui";

const useStyles = makeStyles((theme) => ({
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  message: {
    marginTop: theme.spacing(4),
  },
}));

export { useStyles };
