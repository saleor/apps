import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@saleor/react-hook-form-macaw";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { AppCard } from "./app-card";
import { Section } from "./app-section";

const otelSectionSchema = z.object({
  url: z.string().url(),
});

type OtelConfig = z.infer<typeof otelSectionSchema>;

const defaultOtelConfig: OtelConfig = {
  url: "",
};

export const OTELSection = () => {
  const formMethods = useForm({
    defaultValues: defaultOtelConfig,
    resolver: zodResolver(otelSectionSchema),
  });

  const { control } = formMethods;

  return (
    <>
      <Section.Description
        data-testid="otel-intro"
        title="OTEL settings"
        description={
          <>Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati, minima quam?</>
        }
      />
      <AppCard __minHeight={"320px"} height="100%" data-testid="otel-table">
        <FormProvider {...formMethods}>
          <Input control={control} name="url" required label="Where to emit events" />
        </FormProvider>
      </AppCard>
    </>
  );
};
