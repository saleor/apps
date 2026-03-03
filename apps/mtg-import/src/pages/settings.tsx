import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Box, Button, Input, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { InlineSpinner } from "@/ui/components";

const ALL_SET_TYPES = [
  "core",
  "expansion",
  "masters",
  "draft_innovation",
  "commander",
  "starter",
  "funny",
  "masterpiece",
  "arsenal",
  "from_the_vault",
  "spellbook",
  "premium_deck",
  "duel_deck",
  "box",
  "promo",
  "token",
  "memorabilia",
];

// --- Inline Create Forms ---

interface CreateChannelFormProps {
  onCreated: () => void;
  onCancel: () => void;
}

const CreateChannelForm = ({ onCreated, onCancel }: CreateChannelFormProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");

  const create = trpcClient.settings.createChannel.useMutation({
    onSuccess: () => {
      notifySuccess("Channel created");
      onCreated();
    },
    onError: (err) => notifyError("Failed to create channel", err.message),
  });

  return (
    <Box padding={3} borderRadius={2} backgroundColor="default1" display="flex" flexDirection="column" gap={3}>
      <Text size={2} fontWeight="bold">New Channel</Text>
      <Input label="Name" value={name} onChange={(e) => {
        setName(e.target.value);
        if (!slug || slug === toSlug(name)) setSlug(toSlug(e.target.value));
      }} size="small" />
      <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} size="small" />
      <Input label="Currency" value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())} size="small" />
      <Box display="flex" gap={2}>
        <Button size="small" onClick={() => create.mutate({ name, slug, currencyCode })} disabled={!name || !slug || create.isLoading}>
          {create.isLoading ? "Creating..." : "Create"}
        </Button>
        <Button size="small" variant="secondary" onClick={onCancel}>Cancel</Button>
      </Box>
    </Box>
  );
};

interface CreateSimpleFormProps {
  label: string;
  onCreated: () => void;
  onCancel: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutation: any;
}

const CreateSimpleForm = ({ label, onCreated, onCancel, mutation }: CreateSimpleFormProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();
  const [name, setName] = useState("");

  const create = mutation({
    onSuccess: () => {
      notifySuccess(`${label} created`);
      onCreated();
    },
    onError: (err: { message: string }) => notifyError(`Failed to create ${label.toLowerCase()}`, err.message),
  });

  return (
    <Box padding={3} borderRadius={2} backgroundColor="default1" display="flex" flexDirection="column" gap={3}>
      <Text size={2} fontWeight="bold">New {label}</Text>
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} size="small" />
      <Box display="flex" gap={2}>
        <Button size="small" onClick={() => create.mutate({ name })} disabled={!name || create.isLoading}>
          {create.isLoading ? "Creating..." : "Create"}
        </Button>
        <Button size="small" variant="secondary" onClick={onCancel}>Cancel</Button>
      </Box>
    </Box>
  );
};

interface CreateWarehouseFormProps {
  onCreated: () => void;
  onCancel: () => void;
}

const CreateWarehouseForm = ({ onCreated, onCancel }: CreateWarehouseFormProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();
  const [name, setName] = useState("");
  const [streetAddress1, setStreetAddress1] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("US");

  const create = trpcClient.settings.createWarehouse.useMutation({
    onSuccess: () => {
      notifySuccess("Warehouse created");
      onCreated();
    },
    onError: (err) => notifyError("Failed to create warehouse", err.message),
  });

  return (
    <Box padding={3} borderRadius={2} backgroundColor="default1" display="flex" flexDirection="column" gap={3}>
      <Text size={2} fontWeight="bold">New Warehouse</Text>
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} size="small" />
      <Input label="Street Address" value={streetAddress1} onChange={(e) => setStreetAddress1(e.target.value)} size="small" />
      <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} size="small" />
      <Input label="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} size="small" />
      <Input label="Country (2-letter)" value={country} onChange={(e) => setCountry(e.target.value.toUpperCase())} size="small" />
      <Box display="flex" gap={2}>
        <Button
          size="small"
          onClick={() => create.mutate({ name, streetAddress1: streetAddress1 || "123 Main St", city: city || "Default City", postalCode: postalCode || "00000", country: country || "US" })}
          disabled={!name || create.isLoading}
        >
          {create.isLoading ? "Creating..." : "Create"}
        </Button>
        <Button size="small" variant="secondary" onClick={onCancel}>Cancel</Button>
      </Box>
    </Box>
  );
};

// --- Checkbox helpers ---

interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const CheckboxItem = ({ label, checked, onChange }: CheckboxItemProps) => (
  <Box
    as="label"
    display="flex"
    alignItems="center"
    gap={2}
    cursor="pointer"
    paddingY={1}
  >
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <Text size={2}>{label}</Text>
  </Box>
);

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// --- Main Page ---

const SettingsPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const { notifySuccess, notifyError } = useDashboardNotification();

  const isReady = !!appBridgeState?.ready;

  const settingsQuery = trpcClient.settings.getSettings.useQuery(undefined, { enabled: isReady });
  const optionsQuery = trpcClient.settings.getSaleorOptions.useQuery(undefined, { enabled: isReady });

  const updateMutation = trpcClient.settings.updateSettings.useMutation({
    onSuccess: () => {
      notifySuccess("Settings saved");
      setDirty(false);
    },
    onError: (err) => notifyError("Failed to save settings", err.message),
  });

  // Local form state
  const [channelSlugs, setChannelSlugs] = useState<string[]>([]);
  const [productTypeSlug, setProductTypeSlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [warehouseSlugs, setWarehouseSlugs] = useState<string[]>([]);
  const [conditionNm, setConditionNm] = useState(1.0);
  const [conditionLp, setConditionLp] = useState(0.9);
  const [conditionMp, setConditionMp] = useState(0.75);
  const [conditionHp, setConditionHp] = useState(0.5);
  const [conditionDmg, setConditionDmg] = useState(0.25);
  const [defaultPrice, setDefaultPrice] = useState(0.25);
  const [costPriceRatio, setCostPriceRatio] = useState(0.5);
  const [isPublished, setIsPublished] = useState(true);
  const [visibleInListings, setVisibleInListings] = useState(true);
  const [isAvailableForPurchase, setIsAvailableForPurchase] = useState(true);
  const [trackInventory, setTrackInventory] = useState(false);
  const [importableSetTypes, setImportableSetTypes] = useState<string[]>([]);
  const [physicalOnly, setPhysicalOnly] = useState(true);
  const [includeOversized, setIncludeOversized] = useState(false);
  const [includeTokens, setIncludeTokens] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Inline create form states
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateProductType, setShowCreateProductType] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateWarehouse, setShowCreateWarehouse] = useState(false);

  // Load settings into form
  useEffect(() => {
    if (settingsQuery.data) {
      const s = settingsQuery.data;
      setChannelSlugs(s.channelSlugs);
      setProductTypeSlug(s.productTypeSlug);
      setCategorySlug(s.categorySlug);
      setWarehouseSlugs(s.warehouseSlugs);
      setConditionNm(s.conditionNm);
      setConditionLp(s.conditionLp);
      setConditionMp(s.conditionMp);
      setConditionHp(s.conditionHp);
      setConditionDmg(s.conditionDmg);
      setDefaultPrice(s.defaultPrice);
      setCostPriceRatio(s.costPriceRatio);
      setIsPublished(s.isPublished);
      setVisibleInListings(s.visibleInListings);
      setIsAvailableForPurchase(s.isAvailableForPurchase);
      setTrackInventory(s.trackInventory);
      setImportableSetTypes(s.importableSetTypes);
      setPhysicalOnly(s.physicalOnly);
      setIncludeOversized(s.includeOversized);
      setIncludeTokens(s.includeTokens);
    }
  }, [settingsQuery.data]);

  const markDirty = useCallback(() => setDirty(true), []);

  const handleSave = () => {
    updateMutation.mutate({
      channelSlugs,
      productTypeSlug,
      categorySlug,
      warehouseSlugs,
      conditionNm,
      conditionLp,
      conditionMp,
      conditionHp,
      conditionDmg,
      defaultPrice,
      costPriceRatio,
      isPublished,
      visibleInListings,
      isAvailableForPurchase,
      trackInventory,
      importableSetTypes,
      physicalOnly,
      includeOversized,
      includeTokens,
    });
  };

  const handleEntityCreated = () => {
    optionsQuery.refetch();
    setShowCreateChannel(false);
    setShowCreateProductType(false);
    setShowCreateCategory(false);
    setShowCreateWarehouse(false);
  };

  const toggleChannel = (slug: string) => {
    setChannelSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
    markDirty();
  };

  const toggleWarehouse = (slug: string) => {
    setWarehouseSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
    markDirty();
  };

  const toggleSetType = (type: string) => {
    setImportableSetTypes((prev) =>
      prev.includes(type) ? prev.filter((s) => s !== type) : [...prev, type]
    );
    markDirty();
  };

  if (!isReady) return null;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={6}>
        <Text as="h1" size={10} fontWeight="bold">Settings</Text>
        <Button onClick={handleSave} disabled={!dirty || updateMutation.isLoading}>
          {updateMutation.isLoading ? <InlineSpinner label="Saving..." /> : "Save Settings"}
        </Button>
      </Box>

      {settingsQuery.isLoading && <InlineSpinner label="Loading settings..." />}
      {settingsQuery.error && <Text color="critical1">Error: {settingsQuery.error.message}</Text>}

      {settingsQuery.data && (
        <Box display="flex" flexDirection="column" gap={6}>
          {/* Section 1: Saleor Targets */}
          <Box
            padding={4}
            borderRadius={4}
            borderWidth={1}
            borderStyle="solid"
            borderColor="default1"
          >
            <Text size={5} fontWeight="bold" marginBottom={4}>
              Saleor Targets
            </Text>
              <Box display="flex" flexDirection="column" gap={4}>
                {/* Channels */}
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                    <Text fontWeight="bold">Channels</Text>
                    <Button size="small" variant="secondary" onClick={() => setShowCreateChannel(!showCreateChannel)}>
                      + New
                    </Button>
                  </Box>
                  {showCreateChannel && <CreateChannelForm onCreated={handleEntityCreated} onCancel={() => setShowCreateChannel(false)} />}
                  {optionsQuery.isLoading && <InlineSpinner label="Loading channels..." />}
                  {optionsQuery.data?.channels.map((ch) => (
                    <CheckboxItem
                      key={ch.slug}
                      label={`${ch.name} (${ch.slug}) — ${ch.currencyCode}`}
                      checked={channelSlugs.includes(ch.slug)}
                      onChange={() => toggleChannel(ch.slug)}
                    />
                  ))}
                  {optionsQuery.data?.channels.length === 0 && <Text size={1} color="default2">No channels found</Text>}
                </Box>

                {/* Product Type */}
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                    <Text fontWeight="bold">Product Type</Text>
                    <Button size="small" variant="secondary" onClick={() => setShowCreateProductType(!showCreateProductType)}>
                      + New
                    </Button>
                  </Box>
                  {showCreateProductType && (
                    <CreateSimpleForm
                      label="Product Type"
                      mutation={trpcClient.settings.createProductType.useMutation}
                      onCreated={handleEntityCreated}
                      onCancel={() => setShowCreateProductType(false)}
                    />
                  )}
                  <Box as="select"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={productTypeSlug} onChange={(e: any) => { setProductTypeSlug(e.target.value); markDirty(); }}
                    __width="100%" padding={2} borderRadius={2}
                  >
                    <option value="">Select product type...</option>
                    {optionsQuery.data?.productTypes.map((pt) => (
                      <option key={pt.slug} value={pt.slug}>{pt.name} ({pt.slug})</option>
                    ))}
                  </Box>
                </Box>

                {/* Category */}
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                    <Text fontWeight="bold">Category</Text>
                    <Button size="small" variant="secondary" onClick={() => setShowCreateCategory(!showCreateCategory)}>
                      + New
                    </Button>
                  </Box>
                  {showCreateCategory && (
                    <CreateSimpleForm
                      label="Category"
                      mutation={trpcClient.settings.createCategory.useMutation}
                      onCreated={handleEntityCreated}
                      onCancel={() => setShowCreateCategory(false)}
                    />
                  )}
                  <Box as="select"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={categorySlug} onChange={(e: any) => { setCategorySlug(e.target.value); markDirty(); }}
                    __width="100%" padding={2} borderRadius={2}
                  >
                    <option value="">Select category...</option>
                    {optionsQuery.data?.categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>{cat.name} ({cat.slug})</option>
                    ))}
                  </Box>
                </Box>

                {/* Warehouses */}
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                    <Text fontWeight="bold">Warehouses</Text>
                    <Button size="small" variant="secondary" onClick={() => setShowCreateWarehouse(!showCreateWarehouse)}>
                      + New
                    </Button>
                  </Box>
                  {showCreateWarehouse && <CreateWarehouseForm onCreated={handleEntityCreated} onCancel={() => setShowCreateWarehouse(false)} />}
                  {optionsQuery.data?.warehouses.map((wh) => (
                    <CheckboxItem
                      key={wh.slug}
                      label={`${wh.name} (${wh.slug})`}
                      checked={warehouseSlugs.includes(wh.slug)}
                      onChange={() => toggleWarehouse(wh.slug)}
                    />
                  ))}
                  {optionsQuery.data?.warehouses.length === 0 && <Text size={1} color="default2">No warehouses found</Text>}
                  {warehouseSlugs.length === 0 && optionsQuery.data && optionsQuery.data.warehouses.length > 0 && (
                    <Text size={1} color="default2">None selected — will use first warehouse</Text>
                  )}
                </Box>
              </Box>
          </Box>

          {/* Section 2: Pricing Policy */}
          <Box
            padding={4}
            borderRadius={4}
            borderWidth={1}
            borderStyle="solid"
            borderColor="default1"
          >
            <Text size={5} fontWeight="bold" marginBottom={4}>
              Pricing Policy
            </Text>
              <Box display="flex" flexDirection="column" gap={3}>
                <Box display="flex" gap={3} flexWrap="wrap">
                  <Box __width="130px">
                    <Input label="NM" type="number" value={String(conditionNm)} onChange={(e) => { setConditionNm(Number(e.target.value)); markDirty(); }} size="small" step="0.01" min="0" max="2" />
                  </Box>
                  <Box __width="130px">
                    <Input label="LP" type="number" value={String(conditionLp)} onChange={(e) => { setConditionLp(Number(e.target.value)); markDirty(); }} size="small" step="0.01" min="0" max="2" />
                  </Box>
                  <Box __width="130px">
                    <Input label="MP" type="number" value={String(conditionMp)} onChange={(e) => { setConditionMp(Number(e.target.value)); markDirty(); }} size="small" step="0.01" min="0" max="2" />
                  </Box>
                  <Box __width="130px">
                    <Input label="HP" type="number" value={String(conditionHp)} onChange={(e) => { setConditionHp(Number(e.target.value)); markDirty(); }} size="small" step="0.01" min="0" max="2" />
                  </Box>
                  <Box __width="130px">
                    <Input label="DMG" type="number" value={String(conditionDmg)} onChange={(e) => { setConditionDmg(Number(e.target.value)); markDirty(); }} size="small" step="0.01" min="0" max="2" />
                  </Box>
                </Box>
                <Box display="flex" gap={3}>
                  <Box __width="200px">
                    <Input label="Default Price ($)" type="number" value={String(defaultPrice)} onChange={(e) => { setDefaultPrice(Number(e.target.value)); markDirty(); }} size="small" step="0.01" min="0" />
                  </Box>
                  <Box __width="200px">
                    <Input label="Cost Price Ratio" type="number" value={String(costPriceRatio)} onChange={(e) => { setCostPriceRatio(Number(e.target.value)); markDirty(); }} size="small" step="0.01" min="0" max="1" />
                  </Box>
                </Box>
              </Box>
          </Box>

          {/* Section 3: Product Defaults */}
          <Box
            padding={4}
            borderRadius={4}
            borderWidth={1}
            borderStyle="solid"
            borderColor="default1"
          >
            <Text size={5} fontWeight="bold" marginBottom={4}>
              Product Defaults
            </Text>
              <Box display="flex" flexDirection="column" gap={2}>
                <CheckboxItem label="Published" checked={isPublished} onChange={(v) => { setIsPublished(v); markDirty(); }} />
                <CheckboxItem label="Visible in Listings" checked={visibleInListings} onChange={(v) => { setVisibleInListings(v); markDirty(); }} />
                <CheckboxItem label="Available for Purchase" checked={isAvailableForPurchase} onChange={(v) => { setIsAvailableForPurchase(v); markDirty(); }} />
                <CheckboxItem label="Track Inventory" checked={trackInventory} onChange={(v) => { setTrackInventory(v); markDirty(); }} />
              </Box>
          </Box>

          {/* Section 4: Import Behavior */}
          <Box
            padding={4}
            borderRadius={4}
            borderWidth={1}
            borderStyle="solid"
            borderColor="default1"
          >
            <Text size={5} fontWeight="bold" marginBottom={4}>
              Import Behavior
            </Text>
              <Box display="flex" flexDirection="column" gap={4}>
                {/* Card Filters */}
                <Box>
                  <Text fontWeight="bold" marginBottom={2}>Card Filters</Text>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <CheckboxItem label="Physical cards only (exclude digital / non-paper)" checked={physicalOnly} onChange={(v) => { setPhysicalOnly(v); markDirty(); }} />
                    <CheckboxItem label="Include oversized cards" checked={includeOversized} onChange={(v) => { setIncludeOversized(v); markDirty(); }} />
                    <CheckboxItem label="Include tokens & emblems" checked={includeTokens} onChange={(v) => { setIncludeTokens(v); markDirty(); }} />
                  </Box>
                </Box>

                {/* Set Types */}
                <Box>
                  <Text fontWeight="bold" marginBottom={2}>Importable Set Types</Text>
                  <Box display="flex" flexWrap="wrap" gap={2}>
                    {ALL_SET_TYPES.map((type) => (
                      <CheckboxItem
                        key={type}
                        label={type.replace(/_/g, " ")}
                        checked={importableSetTypes.includes(type)}
                        onChange={() => toggleSetType(type)}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SettingsPage;
