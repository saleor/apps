import { z } from "zod";

export const avataxConfigSchema = z.object({
  name: z.string().min(1, { message: "Name requires at least one character." }),
  username: z.string().min(1, { message: "Username requires at least one character." }),
  password: z.string().min(1, { message: "Password requires at least one character." }),
  isSandbox: z.boolean(),
  companyName: z.string().min(1, { message: "Company name requires at least one character." }),
  isAutocommit: z.boolean(),
});

export type AvataxConfig = z.infer<typeof avataxConfigSchema>;

export const defaultAvataxConfig: AvataxConfig = {
  name: "",
  username: "",
  password: "",
  companyName: "",
  isSandbox: true,
  isAutocommit: false,
};

export const avataxInstanceConfigSchema = z.object({
  id: z.string(),
  provider: z.literal("avatax"),
  config: avataxConfigSchema,
});

export type AvataxInstanceConfig = z.infer<typeof avataxInstanceConfigSchema>;
