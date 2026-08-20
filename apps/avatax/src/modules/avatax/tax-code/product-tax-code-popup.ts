/**
 * Identifies the POPUP extension that shows a product's AvaTax tax code, so the
 * sidebar widget can ask the Dashboard to open it via `actions.OpenPopup`.
 *
 * Shared between the manifest (which declares it) and the widget (which targets
 * it) - they must agree or the Dashboard resolves nothing and the action fails.
 *
 * The Dashboard only resolves popups that are registered on the current page,
 * which is why the manifest declares this on `PRODUCT_DETAILS_MORE_ACTIONS`
 * rather than on the `SEARCH_ACTION` mount: the command palette is unmounted
 * while closed, so its extensions are not in the registry on a product page.
 */
export const PRODUCT_TAX_CODE_POPUP_IDENTIFIER = "product-tax-code-popup";

/** Payload the widget forwards to the popup, since `openPopup` passes no entity context. */
export type ProductTaxCodePopupParams = { productId: string };
