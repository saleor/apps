import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import pino from "pino";
import { z } from "zod";
import { createLogger } from "../../lib/logger";
import { createId } from "../../lib/utils";

const settingsSchema = z.array(z.record(z.any()));

export class CrudSettingsConfigurator {
  private logger: pino.Logger;

  constructor(
    private metadataManager: SettingsManager,
    private saleorApiUrl: string,
    private metadataKey: string
  ) {
    this.metadataKey = metadataKey;
    this.logger = createLogger({ service: "CrudSettingsConfigurator", metadataKey });
  }

  async readAll() {
    this.logger.debug(".readAll called");
    const result = await this.metadataManager.get(this.metadataKey, this.saleorApiUrl);

    if (!result) {
      this.logger.debug("No metadata found");
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
    this.logger.debug(".read called");
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
    this.logger.debug(data, ".create called with:");

    const getResponse = await this.readAll();
    const prevData = getResponse.data;

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
    this.logger.debug(`.delete called with: ${id}`);

    const getResponse = await this.readAll();
    const prevData = getResponse.data;
    const nextData = prevData.filter((item) => item.id !== id);

    await this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(nextData),
      domain: this.saleorApiUrl,
    });
  }

  async update(id: string, data: any) {
    this.logger.debug(data, `.update called with: ${id}`);
    const getResponse = await this.readAll();
    const prevData = getResponse.data;
    const nextData = prevData.map((item) => {
      if (item.id === id) {
        return { id, data };
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
