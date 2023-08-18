import { createLogger } from "@saleor/apps-shared";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";

import { PayloadCmsProviderConfig } from "@/modules/configuration/schemas/payloadcms-provider.schema";
import { FieldsMapper } from "../fields-mapper";

import qs from "qs";
import { z } from "zod";

type Context = {
  configuration: PayloadCmsProviderConfig.FullShape;
  variant: WebhookProductVariantFragment;
};

const responseSchema = z.object({
  docs: z.array(
    z.object({
      id: z.string(),
    }),
  ),
});

export class PayloadCMSClient {
  private logger = createLogger({ name: "PayloadCMSClient" });

  private mapVariantToPayloadFields({ configuration, variant }: Context) {
    const fields = FieldsMapper.mapProductVariantToConfigurationFields({
      variant,
      configMapping: configuration.productVariantFieldsMapping,
    });

    // todo check if it workds, especially json type
    return fields;
  }

  private constructCollectionUrl(config: PayloadCmsProviderConfig.FullShape) {
    return `${config.payloadApiUrl}/${config.collectionName}`;
  }

  getItemsBySaleorVariantId(context: Context) {
    const queryString = qs.stringify(
      {
        where: {
          [context.configuration.productVariantFieldsMapping.variantId]: context.variant.id,
        },
      },
      {
        addQueryPrefix: true,
      },
    );

    return fetch(`${this.constructCollectionUrl(context.configuration)}${queryString}`, {
      headers: this.getHeaders(context),
    }).then((r) => r.json());
  }

  async deleteProductVariant(context: Context) {
    const queryString = qs.stringify(
      {
        where: {
          [context.configuration.productVariantFieldsMapping.variantId]: context.variant.id,
        },
      },
      {
        addQueryPrefix: true,
      },
    );

    try {
      const response = await fetch(
        this.constructCollectionUrl(context.configuration) + queryString,
        {
          method: "DELETE",
          headers: this.getHeaders(context),
        },
      );

      const parsedResponse = await response.json();

      console.log(parsedResponse);
    } catch (e) {
      console.error(e);
    }
  }

  private getHeaders(context: Context) {
    const headers = new Headers({
      "Content-Type": "application/json",
    });

    if (context.configuration.authToken.length > 0) {
      headers.append("Authorization", `JWT ${context.configuration.authToken}`);
    }

    return headers;
  }

  uploadProductVariant(context: Context) {
    this.logger.debug("Trying to upload product variant");

    return fetch(this.constructCollectionUrl(context.configuration), {
      method: "POST",
      body: JSON.stringify(this.mapVariantToPayloadFields(context)),
      headers: this.getHeaders(context),
    }).catch((e) => {
      console.error(e);

      throw e;
    });
  }

  async updateProductVariant({ configuration, variant }: Context) {}

  upsertProduct({ configuration, variant }: Context) {
    this.logger.debug("Trying to upsert product variant");
  }
}
