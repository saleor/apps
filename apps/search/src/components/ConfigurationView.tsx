import { Card, CardContent, CardHeader } from "@material-ui/core";
import { ImportProductsToAlgolia } from "./ImportProductsToAlgolia";
import { AlgoliaConfigurationCard } from "./AlgoliaConfigurationCard";
import { makeStyles } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import { Instructions } from "./Instructions";

import { AppColumnsLayout } from "./AppColumnsLayout";

const useStyles = makeStyles((theme) => ({
  buttonsGrid: { display: "flex", gap: 10 },
  topBar: {
    marginBottom: 32,
  },
  indexActions: {
    marginTop: 10,
  },
  wrapper: {
    minHeight: "100%",
    paddingBottom: 50,
  },
  tabs: { marginLeft: 32, marginBottom: 32 },
}));

export const ConfigurationView = () => {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <AppColumnsLayout>
        <div />
        <div>
          <AlgoliaConfigurationCard />
          <Card className={styles.indexActions}>
            <CardHeader title="Indexing" />
            <CardContent>
              <ImportProductsToAlgolia />
            </CardContent>
          </Card>
        </div>
        <Instructions />
      </AppColumnsLayout>
    </div>
  );
};
