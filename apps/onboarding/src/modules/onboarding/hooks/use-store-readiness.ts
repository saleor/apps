"use client";

import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useMemo, useState } from "react";
import { useQuery } from "urql";

import { StoreReadinessDocument } from "@/generated/graphql";

import {
  getActiveCommerceTaskId,
  getCommerceTasks,
  getReadinessProgress,
  getStoreReadiness,
} from "../readiness/get-store-readiness";
import { getIframeSaleorApiUrl, readHomeSnapshot } from "../readiness/home-snapshot";

const EMPTY_READINESS = getStoreReadiness(undefined);

export const useStoreReadiness = () => {
  const { appBridgeState } = useAppBridge();
  const hasToken = Boolean(appBridgeState?.token);
  const saleorApiUrl = appBridgeState?.saleorApiUrl ?? getIframeSaleorApiUrl();
  const [snapshot] = useState(() => readHomeSnapshot(saleorApiUrl));

  const [{ data, fetching, error }, reexecute] = useQuery({
    query: StoreReadinessDocument,
    pause: !hasToken,
    requestPolicy: "cache-and-network",
  });

  const liveReadiness = useMemo(() => (data ? getStoreReadiness(data) : null), [data]);
  const readiness = liveReadiness ?? snapshot?.readiness ?? EMPTY_READINESS;
  const tasks = getCommerceTasks(readiness);
  const progress = getReadinessProgress(tasks);
  const activeTaskId = getActiveCommerceTaskId(tasks);
  const hasPaintableReadiness = Boolean(liveReadiness ?? snapshot?.readiness);

  return {
    readiness,
    tasks,
    progress,
    activeTaskId,
    loading: !hasPaintableReadiness && (!hasToken || fetching),
    error,
    refresh: () => reexecute({ requestPolicy: "network-only" }),
  };
};
