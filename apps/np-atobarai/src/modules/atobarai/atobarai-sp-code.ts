import { z } from "zod";

const schema = z.string().min(1).brand("AtobaraiSpCode");

export const createAtobaraiSpCode = (raw: string) => schema.parse(raw);

export type AtobaraiSpCode = z.infer<typeof schema>;
