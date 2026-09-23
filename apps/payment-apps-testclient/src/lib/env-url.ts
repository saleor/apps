import { z } from "zod";

export const envUrlSchema = z.string().url().endsWith("/graphql/", "Must end with /graphql/");
