import { z } from "zod";

import { RootConfig } from "./schemas/root-config.schema";

export class AppConfig {
  private rootData: RootConfig.Shape = null;

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
      throw new Error("Error parsing JSON", { cause: e });
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
