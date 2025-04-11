import { BaseError } from "@/lib/errors";

export const GetConfigError = BaseError.subclass("GetConfigError", {
  props: {
    _internalName: "GetConfigError" as const,
  },
});

export const MissingConfigError = BaseError.subclass("MissingConfigError", {
  props: {
    _internalName: "MissingConfigError" as const,
    channelId: "",
  },
});
