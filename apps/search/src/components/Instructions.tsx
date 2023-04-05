import { Card, CardContent, CardHeader, List, ListItem, Typography, Link } from "@material-ui/core";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";

export function Instructions() {
  const { appBridge } = useAppBridge();

  const algoliaDashboardUrl = "https://www.algolia.com/apps/dashboard";
  const algoliaApiKeysUrl = "https://www.algolia.com/account/api-keys/all";

  const openExternalUrl = (to: string) => {
    appBridge?.dispatch({
      type: "redirect",
      payload: {
        newContext: true,
        actionId: "redirect_from_search_app",
        to,
      },
    });
  };

  return (
    <Card>
      <CardHeader title="Instructions" />
      <CardContent>
        <Typography paragraph>
          How to configure
          <List style={{ marginBottom: 20 }}>
            <ListItem>
              <Link
                onClick={(e) => {
                  e.preventDefault();
                  openExternalUrl(algoliaDashboardUrl);
                }}
                href={algoliaDashboardUrl}
              >
                1. Create a new Algolia application
              </Link>
            </ListItem>
            <ListItem>
              <Typography>
                2. Navigate to{" "}
                <Link
                  href={algoliaApiKeysUrl}
                  onClick={() => {
                    openExternalUrl(algoliaApiKeysUrl);
                  }}
                >
                  application keys
                </Link>{" "}
                section and copy values to the form below
              </Typography>
            </ListItem>
            <ListItem>3. Save configuration</ListItem>
          </List>
          Useful links
          <List>
            <ListItem>
              <Link
                onClick={(e) => {
                  e.preventDefault();
                  openExternalUrl("https://github.com/saleor/saleor-app-search");
                }}
              >
                Visit repository & detailed configuration guide
              </Link>
            </ListItem>
          </List>
        </Typography>
      </CardContent>
    </Card>
  );
}
