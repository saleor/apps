import { atom, useAtom } from "jotai";
import { AppTab } from "../../pages/configuration";

const channelSlugAtom = atom("");

export const useChannelSlug = () => {
  const [channelSlug, setChannelSlug] = useAtom(channelSlugAtom);

  return { channelSlug, setChannelSlug };
};

const instanceIdAtom = atom<string | null>(null);

export const useInstanceId = () => {
  const [instanceId, setInstanceId] = useAtom(instanceIdAtom);

  return { instanceId, setInstanceId };
};

const activeTabAtom = atom<AppTab>("channels");

export const useActiveTab = () => {
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  return { activeTab, setActiveTab };
};
