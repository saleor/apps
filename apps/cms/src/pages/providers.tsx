import { AppLayout } from "../modules/ui/app-layout";
import { ProviderInstances } from "../modules/provider-instances/ui/provider-instances";
import { NextPageWithLayout } from "./_app";
import { ReactElement } from "react";

const Page: NextPageWithLayout = () => <ProviderInstances />;

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <main>
      <AppLayout>{page}</AppLayout>
    </main>
  );
};

export default Page;
