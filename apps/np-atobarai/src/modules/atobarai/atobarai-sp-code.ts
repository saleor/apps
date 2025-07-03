import { z } from "zod";

const atobaraiSpCode = z.string().min(1).brand("AtobaraiSpCode");

export const createAtobaraiSpCode = (raw: string) => atobaraiSpCode.parse(raw);

export type AtobaraiSpCode = z.infer<typeof atobaraiSpCode>;
