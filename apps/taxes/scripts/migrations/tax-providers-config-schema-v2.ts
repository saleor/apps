import { z } from "zod";
import { providerConnectionsSchema } from "../../src/modules/provider-connections/provider-connections";

const taxProvidersV2Schema = providerConnectionsSchema;

export type TaxProvidersV2 = z.infer<typeof taxProvidersV2Schema>;
