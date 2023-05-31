import { z } from "zod";
import { obfuscateSecret } from "../../lib/utils";

const addressSchema = z.object({
  country: z.string(),
  zip: z.string(),
  state: z.string(),
  city: z.string(),
  street: z.string(),
});

const avataxCredentialsSchema = z.object({
  username: z.string().min(1, { message: "Username requires at least one character." }),
  password: z.string().min(1, { message: "Password requires at least one character." }),
});

export const avataxConfigSchema = z.object({
  name: z.string().min(1, { message: "Name requires at least one character." }),
  isSandbox: z.boolean(),
  companyCode: z.string().optional(),
  isAutocommit: z.boolean(),
  shippingTaxCode: z.string().optional(),
  credentials: avataxCredentialsSchema,
  address: addressSchema,
});

export type AvataxConfig = z.infer<typeof avataxConfigSchema>;

export const defaultAvataxConfig: AvataxConfig = {
  name: "",
  companyCode: "",
  isSandbox: true,
  isAutocommit: false,
  shippingTaxCode: "",
  credentials: {
    username: "",
    password: "",
  },
  address: {
    city: "",
    country: "",
    state: "",
    street: "",
    zip: "",
  },
};

export const avataxInstanceConfigSchema = z.object({
  id: z.string(),
  provider: z.literal("avatax"),
  config: avataxConfigSchema,
});

export type AvataxInstanceConfig = z.infer<typeof avataxInstanceConfigSchema>;

export const obfuscateAvataxConfig = (config: AvataxConfig): AvataxConfig => ({
  ...config,
  credentials: {
    ...config.credentials,
    username: obfuscateSecret(config.credentials.username),
    password: obfuscateSecret(config.credentials.password),
  },
});

export const obfuscateAvataxInstances = (
  instances: AvataxInstanceConfig[]
): AvataxInstanceConfig[] =>
  instances.map((instance) => ({
    ...instance,
    config: obfuscateAvataxConfig(instance.config),
  }));
