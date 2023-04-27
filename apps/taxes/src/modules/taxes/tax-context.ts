import { atom, useAtom } from "jotai";

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
