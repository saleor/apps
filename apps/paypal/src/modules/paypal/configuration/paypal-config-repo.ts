import { AuthData } from "@saleor/app-sdk/APL";
import { Result } from "neverthrow";

import { PayPalConfig } from "@/modules/paypal/configuration/paypal-config";
import { PayPalMetadataManager } from "@/modules/paypal/configuration/paypal-metadata-manager";

export interface PayPalConfigRepo {
  getPayPalConfig(authData: AuthData): Promise<Result<PayPalConfig | null, Error>>;
  savePayPalConfig(authData: AuthData, config: PayPalConfig): Promise<Result<void, Error>>;
  deletePayPalConfig(authData: AuthData): Promise<Result<void, Error>>;
}

export class PayPalConfigRepoImpl implements PayPalConfigRepo {
  async getPayPalConfig(authData: AuthData): Promise<Result<PayPalConfig | null, Error>> {
    const manager = PayPalMetadataManager.createFromAuthData(authData);
    return manager.get();
  }

  async savePayPalConfig(authData: AuthData, config: PayPalConfig): Promise<Result<void, Error>> {
    const manager = PayPalMetadataManager.createFromAuthData(authData);
    return manager.set(config);
  }

  async deletePayPalConfig(authData: AuthData): Promise<Result<void, Error>> {
    const manager = PayPalMetadataManager.createFromAuthData(authData);
    return manager.delete();
  }
}

export const paypalConfigRepo = new PayPalConfigRepoImpl();