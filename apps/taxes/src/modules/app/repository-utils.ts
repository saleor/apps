import { z } from "zod";

/*
 * // todo: use createRepositoryEntitySchema to create the schemas for all the implementations of CrudSettingsManager
 * * the purpose is to enforce the common format of id (that is generated in the crud settings) and data
 */
export function createRepositoryEntitySchema<T>(schema: z.Schema<T>) {
  return z.object({
    id: z.string(),
    data: schema,
  });
}

export type RepositoryEntity = z.infer<ReturnType<typeof createRepositoryEntitySchema>>;
