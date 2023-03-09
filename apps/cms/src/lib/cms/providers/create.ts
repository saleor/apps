import { z } from "zod";
import { BaseConfig, CreateOperations, Provider } from "../types";

export const createProvider = <TConfig extends BaseConfig>(
  operations: CreateOperations<TConfig>,
  schema: z.ZodType<TConfig>
): Provider<TConfig> => {
  return {
    create: operations,
    schema,
  };
};
