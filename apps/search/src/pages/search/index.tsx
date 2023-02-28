import algoliasearch from "algoliasearch";
import { InstantSearch, Pagination } from "react-instantsearch-hooks-web";
import { Card, CardContent, CardHeader, MenuItem, Select } from "@material-ui/core";
import "instantsearch.css/themes/reset.css";
import "instantsearch.css/themes/satellite.css";
import styles from "../../styles/search.module.css";

import { makeStyles, PageTab, PageTabs } from "@saleor/macaw-ui";
import { SearchBox } from "../../components/SearchBox";
import { Hits } from "../../components/Hits";
import { useRouter } from "next/router";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useConfiguration } from "../../lib/configuration";
import { useMemo, useState } from "react";
import { useQuery } from "react-query";

import { AppColumnsLayout } from "../../components/AppColumnsLayout";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    paddingBottom: 50,
  },
  content: {
    padding: "0 50px",
  },
}));

function Search() {
  const classes = useStyles();
  const { appBridgeState } = useAppBridge();
  const [indexName, setIndexName] = useState<string>();
  const algoliaConfiguration = useConfiguration(
    appBridgeState?.saleorApiUrl,
    appBridgeState?.token
  );

  const searchClient = useMemo(() => {
    if (!algoliaConfiguration.data?.appId || !algoliaConfiguration.data.secretKey) {
      return null;
    }
    return algoliasearch(algoliaConfiguration.data.appId, algoliaConfiguration.data.secretKey);
  }, [algoliaConfiguration?.data?.appId, algoliaConfiguration?.data?.secretKey]);

  const router = useRouter();
  const handleClick = (val: string) => router.push("/" + val);

  const indicesQuery = useQuery({
    queryKey: ["indices"],
    queryFn: () => searchClient?.listIndices(),
    onSuccess: (data) => {
      // auto select the first fetched index to display its contents
      if (data?.items?.length) {
        setIndexName(data.items[0].name);
      }
    },
    enabled: !!searchClient,
  });

  const availableIndices = indicesQuery.data?.items.map((index) => index.name) || [];

  const displayInterface = !!searchClient && indexName;

  return (
    <div className={classes.wrapper}>
      <PageTabs className={styles.tabs} value="search" onChange={handleClick}>
        <PageTab label={"Configuration"} value="" />
        <PageTab label={"Preview"} value="search" />
      </PageTabs>

      <div className={classes.content}>
        {displayInterface ? (
          <InstantSearch searchClient={searchClient} indexName={indexName}>
            <AppColumnsLayout variant="1:2">
              <div className={styles.filterGrid}>
                <Card>
                  <CardHeader title={"Index"} />
                  <CardContent>
                    <Select
                      labelId="index-select-label"
                      id="index-select"
                      value={indexName}
                      onChange={(event) => setIndexName(event.target.value as string)}
                    >
                      {availableIndices.map((name) => (
                        <MenuItem key={name} value={name}>
                          {name}
                        </MenuItem>
                      ))}
                    </Select>
                  </CardContent>
                </Card>
              </div>
              <div className={styles.contentWrapper}>
                <SearchBox />
                <Hits />
                <Pagination />
              </div>
            </AppColumnsLayout>
          </InstantSearch>
        ) : (
          <Card>
            <CardHeader title="To preview indexes, ensure the App is configured" />
          </Card>
        )}
      </div>
    </div>
  );
}

export default Search;
