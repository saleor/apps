import { atom, useAtom } from "jotai";

const channelSlugAtom = atom("");

export const useChannelSlug = () => useAtom(channelSlugAtom);

const instanceIdAtom = atom<string | null>(null);

export const useInstanceId = () => useAtom(instanceIdAtom);
