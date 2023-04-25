const x = () => (
    <SectionWithDescription
        title="Events"
        description={
          <>
            <Text display="block">
              Provide unique name for your configuration - you can create more than one. For example
              - production and development.
            </Text>
            <Text display="block">Then, pass your API Key. Obtain it here.</Text>
          </>
        }
      >
        <BoxWithBorder backgroundColor={"surfaceCriticalSubdued"} borderColor={"criticalSubdued"}>
          <Box padding={defaultPadding}>
            <Text variant="heading" display="block">
              Remove provider
            </Text>
            <Text display="block">You can remove provider configuration.</Text>
            <Text display="block">
              This operation will remove all settings related to this configuration. Data will be
              permanently removed from the App.{" "}
            </Text>
            <Text display="block">
              This operation cant be undone. You still can create new configuration.
            </Text>
          </Box>
          <BoxFooter borderColor={"criticalSubdued"}>
            <Button color={"textNeutralSubdued"} backgroundColor={"interactiveCriticalDefault"}>
              Remove provider
            </Button>
          </BoxFooter>
        </BoxWithBorder>
      </SectionWithDescription>
      <SectionWithDescription
        title="Events"
        description={
          <>
            <Text display="block">
              Provide unique name for your configuration - you can create more than one. For example
              - production and development.
            </Text>
            <Text display="block">Then, pass your API Key. Obtain it here.</Text>
          </>
        }
      >
        <BoxWithBorder>
          <Box
            padding={defaultPadding}
            display={"flex"}
            flexDirection={"column"}
            gap={defaultPadding}
          >
            <Box display="grid" gridTemplateColumns={3} gap={defaultPadding}>
              <Input value={"Order created"} disabled label="Configuration name" />
              <Combobox
                options={[
                  { label: "Template 1", value: "1" },
                  { label: "Template 2", value: "2" },
                ]}
                label="Template"
              />
              <Toggle>
                <Text variant="body">Enabled</Text>
              </Toggle>
            </Box>
            <Box display="grid" gridTemplateColumns={3} gap={defaultPadding}>
              <Input value={"Gift card sent"} disabled label="Configuration name" />
              <Combobox
                options={[
                  { label: "Template 1", value: "1" },
                  { label: "Template 2", value: "2" },
                ]}
                label="Template"
              />
              <Toggle>
                <Text variant="body">Enabled</Text>
              </Toggle>
            </Box>
            <Box display="grid" gridTemplateColumns={3} gap={defaultPadding}>
              <Input value={"Confirm account"} disabled label="Configuration name" />
              <Combobox
                options={[
                  { label: "Template 1", value: "1" },
                  { label: "Template 2", value: "2" },
                ]}
                label="Template"
              />
              <Toggle>
                <Text variant="body">Enabled</Text>
              </Toggle>
            </Box>
          </Box>
          <BoxFooter>
            <Button>Save provider</Button>
          </BoxFooter>
        </BoxWithBorder>
      </SectionWithDescription>
      <SectionWithDescription
        title="Connect Sendgrid"
        description={
          <>
            <Text display="block">
              Provide unique name for your configuration - you can create more than one. For example
              - production and development.
            </Text>
            <Text display="block">Then, pass your API Key. Obtain it here.</Text>
          </>
        }
      >
        <BoxWithBorder>
          <Box padding={defaultPadding} display={"flex"} flexDirection={"column"} gap={10}>
            <Input
              label="Configuration name"
              helperText="Used to distinguish between multiple configurations"
            />
            <Input
              label="API key"
              helperText="Your API key, ensure it has permission XYZ enabled"
            />
          </Box>
          <BoxFooter>
            <Button>Save provider</Button>
          </BoxFooter>
        </BoxWithBorder>
      </SectionWithDescription>
      <SectionWithDescription
        title="Messaging providers"
        description={
          <Text>
            Manage providers configuration to connect Saleor events with 3rd party services.
          </Text>
        }
      >
        <BoxWithBorder
          padding={10}
          display={"grid"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Text>No providers configured yet</Text>
          <Button>Add first provider</Button>
        </BoxWithBorder>
      </SectionWithDescription>
      <SectionWithDescription title="Choose provider">
        <Box display="grid" gridTemplateColumns={2} gap={6}>
          <ProviderSelectionBox
            providerName="Sendgrid"
            providerDescription="Use dynamic templates created in Sendgrid dashboard to send messages. Event data will be forwarded to Sendgrid."
            onClick={() => console.log("clicked sendgrid")}
          />

          <ProviderSelectionBox
            providerName="SMTP & MJML"
            providerDescription="Provide your own SMTP credentials and map Saleor event to custom MJML templates."
            onClick={() => console.log("clicked mjml")}
          />
        </Box>
      </SectionWithDescription>
)
