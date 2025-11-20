// TODO: Move to t3/env entirely

import { z } from "zod";

export const envCoercedNumber = (defaultValue: number) => z.coerce.number().default(defaultValue);
