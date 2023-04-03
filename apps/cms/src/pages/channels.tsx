import { Channels } from "../modules/channels/ui/channels";
import { AppLayout } from "../modules/ui/app-layout";
import { NextPageWithLayout } from "./_app";
import { ReactElement } from "react";

const Page: NextPageWithLayout = () => <Channels />;

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <main>
      <AppLayout>{page}</AppLayout>
    </main>
  );
};

export default Page;
