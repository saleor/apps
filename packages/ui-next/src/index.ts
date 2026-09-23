/**
 * The package's only barrel, and the only file consumers may import from.
 *
 * Deliberately points at implementation modules rather than at a per-folder `index.ts`: a re-export
 * whose only reader is another re-export costs a resolution hop, sends "go to definition" to the
 * wrong file, and lets two components import each other into a cycle that nothing catches until it
 * runs. The boundary this file draws is real — `SOURCE.md` divergences, prop docs and vendored
 * internals stay behind it — so it earns its indirection where a folder index does not.
 */
export {
  ActionDialog,
  type ActionDialogProps,
  type ActionDialogVariant,
} from "./action-dialog/action-dialog";
export {
  afterModalSuccess,
  MODAL_SUCCESS_TOAST_DELAY_MS,
} from "./action-dialog/after-modal-success";
export { AppLink, type AppLinkProps } from "./app-link/app-link";
export { AppPageHeader, type AppPageHeaderProps } from "./app-page-header/app-page-header";
export {
  AsideInfoCard,
  type AsideInfoCardFold,
  type AsideInfoCardProps,
} from "./aside-info-card/aside-info-card";
export { Callout, type CalloutProps, type CalloutType } from "./callout/callout";
export { ChannelIcon, type ChannelIconProps } from "./channel-icon/channel-icon";
export { ChannelListItem, type ChannelListItemProps } from "./channel-icon/channel-list-item";
export {
  CHANNEL_STATUS_SUCCESS_COLOR,
  channelActiveToStatus,
  channelStatusToIconColor,
  channelStatusToLabel,
  type ChannelStatusType,
} from "./channel-icon/types";
export {
  ConfirmButton,
  type ConfirmButtonProps,
  type ConfirmButtonTransitionState,
} from "./confirm-button/confirm-button";
export {
  CountPill,
  countPillFromNumber,
  type CountPillProps,
  type CountPillValue,
} from "./count-pill/count-pill";
export { DashboardModal, type DashboardModalContentSize } from "./dashboard-modal/dashboard-modal";
export { DetailGroupBox, type DetailGroupBoxProps } from "./detail-group-box/detail-group-box";
export {
  type DetailContentScrollport,
  getDetailContentScrollRoot,
  readDetailContentScrollport,
  scrollElementIntoDetailContent,
  scrollToDetailSection,
  subscribeToDetailContentScroll,
} from "./detail-page-layout/detail-content-scroll";
export { DetailPageLayout } from "./detail-page-layout/detail-page-layout";
export {
  DetailSectionNav,
  type DetailSectionNavItem,
  type DetailSectionNavProps,
} from "./detail-section-nav/detail-section-nav";
export { resolveActiveSectionIndex } from "./detail-section-nav/resolve-active-section-index";
export { useDetailSectionScrollSpy } from "./detail-section-nav/use-detail-section-scroll-spy";
export {
  DetailSettingNestedField,
  DetailSettingToggleRow,
  type DetailSettingToggleRowProps,
} from "./detail-setting-toggle-row/detail-setting-toggle-row";
export {
  coerceHeaderEndActions,
  DETAIL_SETTINGS_CARD_HEADER_ACTION_SIZE,
} from "./detail-settings-card/coerce-header-end-actions";
export {
  DetailSettingsCard,
  DetailSettingsCardIntro,
  detailSettingsCardStyles,
  DetailSettingsCardTitle,
  DetailSettingsOptionalLabel,
} from "./detail-settings-card/detail-settings-card";
export {
  EmptyAssignCallout,
  type EmptyAssignCalloutProps,
} from "./empty-assign-callout/empty-assign-callout";
export { ExitFormDialog, type ExitFormDialogProps } from "./exit-form-dialog/exit-form-dialog";
export { IconButton, type IconButtonProps } from "./icon-button/icon-button";
export { type IconSize, iconSize, iconStrokeWidth, iconStrokeWidthBySize } from "./icons/icon-size";
export { InfoTooltip, type InfoTooltipProps } from "./info-tooltip/info-tooltip";
export { ListSubheader, type ListSubheaderProps } from "./list-subheader/list-subheader";
export { Pill, type PillProps } from "./pill/pill";
export { Savebar, type SavebarProps } from "./savebar/savebar";
export {
  type SettingsOwnership,
  SettingsOwnershipChip,
} from "./settings-ownership-chip/settings-ownership-chip";
export {
  SettingsPageContent,
  type SettingsPageContentProps,
} from "./settings-page-content/settings-page-content";
export {
  SettingsFieldStack,
  type SettingsFieldStackProps,
  SettingsSection,
  type SettingsSectionProps,
} from "./settings-section/settings-section";
export {
  ParkedSetupChecklist,
  type ParkedSetupChecklistProps,
} from "./setup-checklist/parked-setup-checklist";
export {
  SetupChecklist,
  SetupChecklistBadge,
  setupChecklistStyles,
} from "./setup-checklist/setup-checklist";
export { SetupChecklistReviewList } from "./setup-checklist/setup-checklist-review-list";
export type {
  SetupChecklistProgress,
  SetupChecklistProps,
  SetupChecklistReviewItem,
  SetupChecklistReviewSection,
  SetupChecklistSectionHeader,
  SetupChecklistTask,
  SetupChecklistTaskStatus,
} from "./setup-checklist/types";
export { Skeleton, type SkeletonProps } from "./skeleton/skeleton";
export { StatusChip, type StatusChipProps } from "./status-chip/status-chip";
export { StatusDot, type StatusDotProps } from "./status-dot/status-dot";
export { type StatusTone } from "./status-dot/status-tone";
export { StatusLabel, type StatusLabelProps } from "./status-label/status-label";
export { SaleorThrobber, type SaleorThrobberProps } from "./throbber/saleor-throbber";
export { ToggleChip, type ToggleChipProps } from "./toggle-chip/toggle-chip";
/* `TooltipBody` stays unexported on purpose: it is the width cap the chips share, not a component. */
