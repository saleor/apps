import { zodResolver } from "@hookform/resolvers/zod";
import { Layout } from "@saleor/apps-ui";
import { Box, Button } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

import { newStripeConfigInputSchema } from "@/modules/app-config/trpc-handlers/new-stripe-config-input-schema";
import { trpcClient } from "@/modules/trpc/trpc-client";

type FormShape = {
  restrictedKey: string;
  name: string;
  publishableKey: string;
};

export const NewStripeConfigForm = () => {
  const router = useRouter();
  const { mutate } = trpcClient.appConfig.saveNewStripeConfig.useMutation({
    onSuccess() {
      return router.push("/config");
    },
    onError() {
      // todo show error
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormShape>({
    defaultValues: {
      restrictedKey: "",
      name: "",
      publishableKey: "",
    },
    resolver: zodResolver(newStripeConfigInputSchema),
  });

  const onSubmit = (values: FormShape) => {
    mutate({
      name: values.name,
      publishableKey: values.publishableKey,
      restrictedKey: values.restrictedKey,
    });
  };

  return (
    <Layout.AppSectionCard
      footer={
        <Button form="new_stripe_config_form" type="submit">
          Save
        </Button>
      }
    >
      <Box id="new_stripe_config_form" as="form" onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column" gap={6}>
          <Input
            label="Configuration name"
            name="name"
            control={control}
            helperText={
              errors.name?.message ??
              "Friendly name of your configuration. For example 'Live' or 'UK Live' "
            }
            error={!!errors.name}
          />
          <Input
            label="Publishable key"
            name="publishableKey"
            control={control}
            helperText={
              errors.publishableKey?.message ?? "Publishable key generated in Stripe dashboard"
            }
            error={!!errors.publishableKey}
          />
          <Input
            label="Restricted key"
            name="restrictedKey"
            control={control}
            type="password"
            helperText={
              errors.restrictedKey?.message ??
              "Restricted key generated in Stripe dashboard. You won't be able to see it again"
            }
            error={!!errors.restrictedKey}
          />
        </Box>
      </Box>
    </Layout.AppSectionCard>
  );
};

// todo link to stripe docs
