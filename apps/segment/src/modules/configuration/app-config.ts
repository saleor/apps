import { z } from "zod";

import { BaseError } from "@/errors";

import { RootConfig } from "./schemas/root-config.schema";

export class AppConfig {
  private rootData: RootConfig.Shape = null;

  static JSONParseError = BaseError.subclass("JSONParseError");

  constructor(initialData?: RootConfig.Shape) {
    if (initialData) {
      this.rootData = RootConfig.Schema.parse(initialData);
    }
  }

  static parse(serializedSchema: string) {
    try {
      const parsedJSON = JSON.parse(serializedSchema);

      return new AppConfig(parsedJSON as RootConfig.Shape);
    } catch (e) {
      throw new AppConfig.JSONParseError("Error parsing JSON with app config", { cause: e });
    }
  }

  serialize() {
    return JSON.stringify(this.rootData);
  }

  setSegmentWriteKey(key: string) {
    const parsedKey = z.string().min(1).parse(key);

    if (this.rootData) {
      this.rootData.segmentWriteKey = parsedKey;
    } else {
      this.rootData = {
        segmentWriteKey: parsedKey,
      };
    }

    return this;
  }

  getConfig() {
    return this.rootData;
  }
}
