import { Box, Button } from "@saleor/macaw-ui/next";
import { Input } from "@saleor/react-hook-form-macaw";
import { RootConfig } from "../schemas/root-config.schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextLink } from "@saleor/apps-ui";
import { Text } from "@saleor/macaw-ui/next";
import { ButtonsBox } from "@/modules/ui/buttons-box";

const Schema = RootConfig.Schema.unwrap();

type Shape = z.infer<typeof Schema>;

const SegmentConfigFormBase = (props: { values: Shape }) => {
  const { control } = useForm({
    resolver: zodResolver(Schema),
    defaultValues: props.values,
  });

  return (
    <Box as="form">
      <Input
        control={control}
        name="segmentWriteKey"
        label="Segment write key"
        helperText={
          <Text variant="caption" as="p" marginTop={2}>
            Read about write keys in{" "}
            <TextLink size="small" href="https://segment.com/docs/connections/find-writekey/">
              Segment documentation
            </TextLink>
          </Text>
        }
      />
      <ButtonsBox marginTop={6}>
        <Button type="submit">Save</Button>
      </ButtonsBox>
    </Box>
  );
};

export const SegmentConfigForm = () => {
  // todo fetch from trpc

  return <SegmentConfigFormBase values={{ segmentWriteKey: "" }} />;
};
