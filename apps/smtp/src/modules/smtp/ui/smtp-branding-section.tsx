import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useForm } from "react-hook-form";

import { BoxFooter } from "../../../components/box-footer";
import { BoxWithBorder } from "../../../components/box-with-border";
import { SectionWithDescription } from "../../../components/section-with-description";
import { defaultPadding } from "../../../components/ui-defaults";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { trpcClient } from "../../trpc/trpc-client";
import {
  SmtpUpdateBranding,
  smtpUpdateBrandingSchema,
} from "../configuration/smtp-config-input-schema";
import { SmtpConfiguration } from "../configuration/smtp-config-schema";

interface SmtpBrandingSectionProps {
  configuration: SmtpConfiguration;
}

export const SmtpBrandingSection = ({ configuration }: SmtpBrandingSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();
  const { handleSubmit, control, setError } = useForm<SmtpUpdateBranding>({
    defaultValues: {
      id: configuration.id,
      brandingSiteName: configuration.brandingSiteName ?? "",
      brandingLogoUrl: configuration.brandingLogoUrl ?? "",
    },
    resolver: zodResolver(smtpUpdateBrandingSchema),
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.smtpConfiguration.updateBranding.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration saved");
      trpcContext.smtpConfiguration.invalidate();
    },
    onError(error) {
      setBackendErrors<SmtpUpdateBranding>({
        error,
        setError,
        notifyError,
      });
    },
  });

  return (
    <SectionWithDescription
      title="Email branding"
      description={
        <Box display="flex" flexDirection="column" gap={2}>
          <Text as="p">Customize the branding that appears in your email headers and footers.</Text>
          <Text as="p">
            These values are available as template variables and are used in the default templates.
          </Text>
        </Box>
      }
    >
      <BoxWithBorder>
        <form
          onSubmit={handleSubmit((data) => {
            mutate({
              ...data,
              brandingSiteName: data.brandingSiteName || undefined,
              brandingLogoUrl: data.brandingLogoUrl || undefined,
            });
          })}
        >
          <Box padding={defaultPadding} display="flex" flexDirection="column" gap={7}>
            <Input
              label="Site name"
              name="brandingSiteName"
              control={control}
              helperText="Your store or company name displayed in email header and footer"
            />
            <Input
              label="Logo URL"
              name="brandingLogoUrl"
              control={control}
              helperText="Full URL to your logo image (e.g., https://example.com/logo.png). Leave empty to show site name as text."
            />
          </Box>
          <BoxFooter>
            <Button type="submit">Save branding</Button>
          </BoxFooter>
        </form>
      </BoxWithBorder>
    </SectionWithDescription>
  );
};
