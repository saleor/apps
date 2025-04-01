import pkg from "../../../package.json";
import { meterProvider } from "./meter-provider";

export const internalMeter = meterProvider.getMeter("saleor.app.avatax.core", pkg.version);

export const externalMeter = meterProvider.getMeter("saleor.app.avatax.service", pkg.version);
