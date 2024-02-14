import { atom, useAtom } from "jotai";

const statusAtom = atom<
  "not_authenticated" | "authenticated" | "address_valid" | "address_invalid" | "address_verified"
>("not_authenticated");

export const useAvataxConfigurationStatus = () => {
  const [status, setStatus] = useAtom(statusAtom);

  return { status, setStatus };
};
