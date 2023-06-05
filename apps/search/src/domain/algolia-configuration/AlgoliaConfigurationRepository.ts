import { prisma, Prisma } from "../../db/prisma";

export class AlgoliaConfigurationRepository {
  constructor(private prisma: Prisma) {}

  getConfiguration(saleorApiUrl: string) {
    return this.prisma.algoliaConfiguration.findFirst({
      where: {
        saleorApiUrl: saleorApiUrl,
      },
    });
  }

  setConfiguration(
    saleorApiUrl: string,
    configuration: {
      appId: string;
      indexNamePrefix?: string;
      secretKey: string;
    }
  ) {
    return this.prisma.algoliaConfiguration.upsert({
      where: {
        saleorApiUrl: saleorApiUrl,
      },
      create: {
        saleorApiUrl,
        appId: configuration.appId,
        indexNamePrefix: configuration.indexNamePrefix,
        secretKey: configuration.secretKey,
      },
      update: {
        saleorApiUrl,
        appId: configuration.appId,
        indexNamePrefix: configuration.indexNamePrefix,
        secretKey: configuration.secretKey,
      },
    });
  }
}

export const algoliaConfigurationRepository = new AlgoliaConfigurationRepository(prisma);
