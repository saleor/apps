import { SettingsManager } from "@saleor/app-sdk/settings-manager";

import { z } from "zod";
import { createLogger, Logger } from "../../lib/logger";
import { createId } from "../../lib/utils";

const settingSchema = z.record(z.any()).and(z.object({ id: z.string() }));
const settingsSchema = z.array(settingSchema);

export class CrudSettingsManager {
  private logger: Logger;

  constructor(
    /*
     * // todo: invoke createSettingsManager in constructor
     * // todo: constructor should accept schema that should be used to validate data
     * Currently, CrudSettingsManager has a big limitation of not validating the inputs in any way.
     * We rely on the classes that implement CrudSettingsManager to provide the data in the correct format,
     * but when you are doing that you must be aware of certain choices CrudSettingsManager makes for you
     * (like creating an "id" field, or how it updates the data).
     * So if you make a mistake in data transformations in your class, you will not get any errors.
     */
    private metadataManager: SettingsManager,
    private saleorApiUrl: string,
    private metadataKey: string
  ) {
    this.metadataKey = metadataKey;
    this.logger = createLogger({ name: "CrudSettingsManager", metadataKey });
  }

  async readAll() {
    const result = await this.metadataManager.get(this.metadataKey, this.saleorApiUrl);

    if (!result) {
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

  async readById(id: string) {
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
    const settings = await this.readAll();
    const prevData = settings.data;
    const nextData = prevData.filter((item) => item.id !== id);

    await this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(nextData),
      domain: this.saleorApiUrl,
    });
  }

  async updateById(id: string, input: any) {
    const { data: currentSettings } = await this.readAll();
    const nextSettings = currentSettings.map((item) => {
      if (item.id === id) {
        const { id, ...rest } = item;

        return { id, ...rest, ...input };
      }
      return item;
    });

    await this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(nextSettings),
      domain: this.saleorApiUrl,
    });
  }
}
