import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/errors";

import { RootConfig } from "./schemas/root-config.schema";

export class AppConfig {
  static SetSegmentKeyError = BaseError.subclass("SetSegmentKeyError");

  constructor(private rootData: RootConfig.Shape) {}

  setSegmentWriteKey(
    key: string,
  ): Result<AppConfig, InstanceType<typeof AppConfig.SetSegmentKeyError>> {
    const parsedKey = RootConfig.Schema.shape.segmentWriteKey.safeParse(key);

    if (!parsedKey.success) {
      return err(
        new AppConfig.SetSegmentKeyError("Invalid segment write key", {
          cause: parsedKey.error,
        }),
      );
    }

    this.rootData.segmentWriteKey = parsedKey.data;

    return ok(this);
  }

  getSegmentWriteKey() {
    return this.rootData.segmentWriteKey;
  }

  getConfig() {
    return this.rootData;
  }
}
