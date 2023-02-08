import algoliasearch from "algoliasearch";
import {
  InstantSearch,
  Pagination,
  Breadcrumb,
  HierarchicalMenu,
} from "react-instantsearch-hooks-web";
import { Card, CardContent, CardHeader, Typography } from "@material-ui/core";
import { RangeInput } from "react-instantsearch-hooks-web";
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
import { Select, MenuItem } from "@material-ui/core";
import { useQuery } from "react-query";
import { SearchAppMainBar } from "../../components/SearchAppMainBar";
import { AppColumnsLayout } from "../../components/AppColumnsLayout";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    border: `1px solid ${theme.palette.grey.A100}`,
    minHeight: "calc(100vh - 100px)",
    paddingBottom: 50,
  },
}));

function Search() {
  const classes = useStyles();
  const { appBridgeState } = useAppBridge();
  const [indexName, setIndexName] = useState<string>();
  const algoliaConfiguration = useConfiguration(
    appBridgeState?.saleorApiUrl,
    appBridgeState?.token,
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
      <SearchAppMainBar />
      <PageTabs className={styles.tabs} value="search" onChange={handleClick}>
        <PageTab label={"Configuration"} value="" />
        <PageTab label={"Preview"} value="search" />
      </PageTabs>

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

              <Card>
                <CardHeader title={"Categories"} />
                <CardContent>
                  <HierarchicalMenu
                    attributes={["categories.lvl0", "categories.lvl1", "categories.lvl1"]}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader title={"Filters"} />
                <CardContent>
                  <RangeInput attribute="grossPrice" />
                </CardContent>
              </Card>
            </div>
            <div className={styles.contentWrapper}>
              <Breadcrumb attributes={["categories.lvl0", "categories.lvl1", "categories.lvl2"]} />
              <SearchBox />
              <Hits />
              <Pagination />
            </div>
          </AppColumnsLayout>
        </InstantSearch>
      ) : (
        <Card>
          <CardHeader title="To preview indexes, ensure app is configured" />
        </Card>
      )}
    </div>
  );
}

export default Search;
