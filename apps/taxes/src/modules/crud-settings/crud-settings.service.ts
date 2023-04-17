import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import pino from "pino";
import { z } from "zod";
import { createLogger } from "../../lib/logger";
import { createId } from "../../lib/utils";

const settingSchema = z.record(z.any()).and(z.object({ id: z.string() }));
const settingsSchema = z.array(settingSchema);

export class CrudSettingsManager {
  private logger: pino.Logger;

  constructor(
    private metadataManager: SettingsManager,
    private saleorApiUrl: string,
    private metadataKey: string
  ) {
    this.metadataKey = metadataKey;
    this.logger = createLogger({ service: "CrudSettingsManager", metadataKey });
  }

  async readAll() {
    this.logger.trace(".readAll called");
    const result = await this.metadataManager.get(this.metadataKey, this.saleorApiUrl);

    if (!result) {
      this.logger.trace("No metadata found");
      return { data: [] };
    }

    const data = JSON.parse(result);
    const validation = settingsSchema.safeParse(data);

    if (!validation.success) {
      this.logger.error({ error: validation.error }, "Error while validating metadata");
      throw new Error("Error while validating metadata");
    }

    return {
      data: validation.data,
    };
  }

  async read(id: string) {
    this.logger.trace(".read called");
    const result = await this.readAll();
    const { data: settings } = result;

    const item = settings.find((item) => item.id === id);

    if (!item) {
      this.logger.error({ id }, "Item not found");
      throw new Error("Item not found");
    }

    return {
      data: item,
    };
  }

  async create(data: any) {
    this.logger.trace(data, ".create called with:");

    const settings = await this.readAll();
    const prevData = settings.data;

    const id = createId();
    const newData = [...prevData, { ...data, id }];

    await this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(newData),
      domain: this.saleorApiUrl,
    });

    return {
      data: { id },
    };
  }

  async delete(id: string) {
    this.logger.trace(`.delete called with: ${id}`);

    const settings = await this.readAll();
    const prevData = settings.data;
    const nextData = prevData.filter((item) => item.id !== id);

    await this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(nextData),
      domain: this.saleorApiUrl,
    });
  }

  async update(id: string, data: any) {
    this.logger.trace(data, `.update called with: ${id}`);
    const { data: settings } = await this.readAll();
    const nextData = settings.map((item) => {
      if (item.id === id) {
        return { id, ...data };
      }
      return item;
    });

    await this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(nextData),
      domain: this.saleorApiUrl,
    });
  }
}
