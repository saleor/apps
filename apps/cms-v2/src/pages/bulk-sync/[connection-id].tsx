import { BulkSyncView } from "@/modules/bulk-sync/bulk-sync-view";
import { NextPage } from "next";
import { useRouter } from "next/router";

const BulkSyncPage: NextPage = () => {
  const { query } = useRouter();
  const id = query["connection-id"] as string | undefined;

  if (!id) {
    return null; //
  }

  // todo redirect if not found

  return <BulkSyncView connectionId={id} />;
};

export default BulkSyncPage;
