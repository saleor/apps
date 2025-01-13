import { useRouter } from "next/router";
import { useEffect } from "react";

import { trpcClient } from "../../trpc/trpc-client";

/**
 * This app requires channels to exist, so redirect to error page if channels don't exist
 */
export const useChannelsExistenceChecking = () => {
  const channels = trpcClient.channels.fetch.useQuery();
  const router = useRouter();

  useEffect(() => {
    if (channels.isSuccess && channels.data.length === 0) {
      router.push("/not-ready");
    }
  }, [channels.data, channels.isSuccess, router]);
};
