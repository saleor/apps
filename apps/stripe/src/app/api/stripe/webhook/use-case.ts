import { AppConfigRepo } from "@/modules/app-config/app-config-repo";

export class StripeWebhookUseCase {
  private appConfigRepo: AppConfigRepo;

  constructor(deps: { appConfigRepo: AppConfigRepo }) {
    this.appConfigRepo = deps.appConfigRepo;
  }

  execute() {}
}
