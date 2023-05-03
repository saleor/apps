import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { trpcClient } from "../../../../modules/trpc/trpc-client";
import { useRouter } from "next/router";
import { useDashboardNotification } from "@saleor/apps-shared";
import { BasicLayout } from "../../../../components/basic-layout";
import { BasicInformationSection } from "../../../../modules/mjml/ui/basic-information-section";

const LoadingView = () => {
  return (
    <BasicLayout
      breadcrumbs={[
        { name: "Configuration", href: "/" },
        { name: "Mjml provider" },
        { name: "..." },
      ]}
    >
      <Text variant="hero">Loading...</Text>
    </BasicLayout>
  );
};

const NotFoundView = () => {
  return (
    <BasicLayout
      breadcrumbs={[
        { name: "Configuration", href: "/" },
        { name: "Mjml provider" },
        { name: "Not found" },
      ]}
    >
      <Text variant="hero">Could not find the requested configuration.</Text>
    </BasicLayout>
  );
};

const EditMjmlConfigurationPage: NextPage = () => {
  const { notifyError } = useDashboardNotification();
  const router = useRouter();
  const { id } = router.query;
  const { data: configuration, isLoading } = trpcClient.mjmlConfiguration.getConfiguration.useQuery(
    {
      id: id as string,
    },
    {
      enabled: !!id,
      onSettled(data, error) {
        if (error) {
          console.log("Error: ", error);
        }
        if (error?.data?.code === "NOT_FOUND" || !data) {
          notifyError("The requested configuration does not exist.");
          router.replace("/configuration");
        }
      },
    }
  );

  if (isLoading) {
    return <LoadingView />;
  }

  if (!configuration) {
    return <NotFoundView />;
  }

  return (
    <BasicLayout
      breadcrumbs={[
        { name: "Configuration", href: "/configuration" },
        { name: "Mjml provider" },
        { name: configuration.name },
      ]}
    >
      <Box display={"grid"} gridTemplateColumns={{ desktop: 3, mobile: 1 }}>
        <Box>
          <Text>Connect Mjml with Saleor.</Text>
        </Box>
      </Box>
      <BasicInformationSection configuration={configuration} />
    </BasicLayout>
  );
};

export default EditMjmlConfigurationPage;
