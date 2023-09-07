import { z } from "zod";
import { RootConfig } from "./schemas/root-config.schema";

export class AppConfig {
  private rootData: RootConfig.Shape = {};

  constructor(initialData?: RootConfig.Shape) {
    if (initialData) {
      this.rootData = RootConfig.Schema.parse(initialData);
    }
  }

  static parse(serializedSchema: string) {
    return new AppConfig(JSON.parse(serializedSchema));
  }

  serialize() {
    return JSON.stringify(this.rootData);
  }

  getConfig() {
    return this.rootData;
  }
}
