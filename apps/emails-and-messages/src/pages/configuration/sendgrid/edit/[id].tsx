import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { Breadcrumbs } from "../../../../components/breadcrumbs";
import { trpcClient } from "../../../../modules/trpc/trpc-client";
import { useRouter } from "next/router";
import { BasicInformationSection } from "../../../../modules/sendgrid/ui/basic-information-section";
import { DangerousSection } from "../../../../modules/sendgrid/ui/dangrous-section";
import { SectionWithDescription } from "../../../../components/section-with-description";
import { ApiConnectionSection } from "../../../../modules/sendgrid/ui/api-connection-section";
import { SenderSection } from "../../../../modules/sendgrid/ui/sender-section";

const EditSendgridConfigurationPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: configuration } = trpcClient.sendgridConfiguration.getConfiguration.useQuery({
    id: id as string,
  });

  return (
    <Box padding={10} display={"grid"} gap={13}>
      <Breadcrumbs
        items={[{ name: "Configuration", href: "/" }, { name: "Sendgrid" }, { name: "Sendgrid" }]}
      />
      <Box display={"grid"} gridTemplateColumns={{ desktop: 3, mobile: 1 }}>
        <Box>
          <Text>Connect Sendgrid with Saleor.</Text>
        </Box>
      </Box>
      {!!configuration && <BasicInformationSection configuration={configuration} />}
      {!!configuration && <ApiConnectionSection configuration={configuration} />}
      {!!configuration && <SenderSection configuration={configuration} />}
      {!!configuration && <DangerousSection configuration={configuration} />}
    </Box>
  );
};

export default EditSendgridConfigurationPage;
