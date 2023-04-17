import { z } from "zod";
import { obfuscateSecret } from "../../lib/utils";

export const avataxConfigSchema = z.object({
  name: z.string().min(1, { message: "Name requires at least one character." }),
  username: z.string().min(1, { message: "Username requires at least one character." }),
  password: z.string().min(1, { message: "Password requires at least one character." }),
  isSandbox: z.boolean(),
  companyCode: z.string().min(1, { message: "Company code requires at least one character." }),
  isAutocommit: z.boolean(),
});

export type AvataxConfig = z.infer<typeof avataxConfigSchema>;

export const defaultAvataxConfig: AvataxConfig = {
  name: "",
  username: "",
  password: "",
  companyCode: "",
  isSandbox: true,
  isAutocommit: false,
};

export const avataxInstanceConfigSchema = z.object({
  id: z.string(),
  provider: z.literal("avatax"),
  config: avataxConfigSchema,
});

export type AvataxInstanceConfig = z.infer<typeof avataxInstanceConfigSchema>;

export const obfuscateAvataxConfig = (config: AvataxConfig) => ({
  ...config,
  username: obfuscateSecret(config.username),
  password: obfuscateSecret(config.password),
});

export const obfuscateAvataxInstances = (instances: AvataxInstanceConfig[]) =>
  instances.map((instance) => ({
    ...instance,
    config: obfuscateAvataxConfig(instance.config),
  }));
