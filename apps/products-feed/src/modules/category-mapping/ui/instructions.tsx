import { Link, Paper, Typography } from "@material-ui/core";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { makeStyles } from "@saleor/macaw-ui";

const useStyles = makeStyles((theme) => {
  return {
    instructionsContainer: {
      padding: 15,
    },
  };
});

export const Instructions = () => {
  const styles = useStyles();

  const { appBridge } = useAppBridge();

  return (
    <Paper elevation={0} className={styles.instructionsContainer}>
      <Typography paragraph variant="h4">
        Using the feed
      </Typography>
      <Typography paragraph>
        Configure your Google Merchant account to schedule fetches of the feed. Instructions can be
        found{" "}
        <Link
          href="https://support.google.com/merchants/answer/1219255"
          onClick={() => {
            appBridge?.dispatch(
              actions.Redirect({
                to: "https://support.google.com/merchants/answer/1219255",
                newContext: true,
              })
            );
          }}
        >
          here
        </Link>
        .
      </Typography>

      <Typography paragraph variant="h4">
        URL templates
      </Typography>
      <Typography paragraph>
        URLs to products in your storefront are generated dynamically, based on the product data.
        For example, the template
      </Typography>
      <code>{"https://example.com/product/{productSlug}"}</code>
      <Typography paragraph>Will produce</Typography>
      <code>{"https://example.com/product/red-t-shirt"}</code>
      <Typography paragraph>Available fields: productId, productSlug, variantId</Typography>
    </Paper>
  );
};
