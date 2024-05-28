import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { AppCard } from "./app-card";
import { Section } from "./app-section";

const otelSectionSchema = z.object({
  url: z.string().url(),
  headers: z.array(z.object({ key: z.string(), value: z.string() })),
});

type OtelConfig = z.infer<typeof otelSectionSchema>;

const defaultOtelConfig: OtelConfig = {
  url: "",
  headers: [],
};

export const OTELSection = () => {
  const formMethods = useForm({
    defaultValues: defaultOtelConfig,
    resolver: zodResolver(otelSectionSchema),
  });

  const { control } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "headers",
  });

  return (
    <>
      <Section.Description
        data-testid="otel-intro"
        title="OTEL settings"
        description={
          <>Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati, minima quam?</>
        }
      />
      <AppCard __minHeight={"320px"} height="100%" data-testid="otel-table" display="grid" gap={2}>
        <FormProvider {...formMethods}>
          <Input control={control} name="url" required label="Where to emit events" />
          <Box title="Headers" width="100%" display="grid" gap={2}>
            <Box>Add additional headers required by your OTEL collector.</Box>
            <Box width="100%" display="grid" gap={3}>
              {fields.map((field, index) => (
                <Box display="flex" width="100%" justifyContent="space-between">
                  <Input control={control} key={field.id} name={`headers.${index}.key`} />
                  <Input control={control} key={field.id} name={`headers.${index}.value`} />
                  <Button onClick={() => remove(index)}>Remove</Button>
                </Box>
              ))}
            </Box>
            <Button onClick={() => append({ key: "", value: "" })}>Add +</Button>
          </Box>
        </FormProvider>
      </AppCard>
    </>
  );
};
