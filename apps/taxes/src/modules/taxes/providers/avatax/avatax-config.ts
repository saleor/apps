import { z } from "zod";
import { obfuscateSecret } from "../../../../lib/utils";
import { createProviderInstanceSchema } from "../../tax-common-schema";

const avataxConfigSchema = z.object({
  username: z.string().min(1, { message: "Username requires at least one character." }),
  password: z.string().min(1, { message: "Password requires at least one character." }),
  isSandbox: z.boolean(),
  companyName: z.string().min(1, { message: "Company name requires at least one character." }),
  isAutocommit: z.boolean(),
});

export type AvataxConfig = z.infer<typeof avataxConfigSchema>;

export const defaultAvataxConfig: AvataxConfig = {
  username: "",
  password: "",
  companyName: "",
  isSandbox: true,
  isAutocommit: false,
};

export const avataxInstanceConfigSchema = createProviderInstanceSchema(
  "avatax",
  avataxConfigSchema
);

const transformedAvataxConfigSchema = avataxConfigSchema.transform((config) => {
  return {
    ...config,
    username: obfuscateSecret(config.username),
    password: obfuscateSecret(config.username),
  };
});

export const serverAvataxSchema = createProviderInstanceSchema(
  "avatax",
  transformedAvataxConfigSchema
);
