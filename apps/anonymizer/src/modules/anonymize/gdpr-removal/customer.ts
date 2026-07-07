/**
 * The shape of a customer resolved from the ID the Dashboard passes to the GDPR
 * Removal extension (see the `CustomerById` query).
 */
export type ResolvedCustomer = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isStaff: boolean;
};

/**
 * Staff accounts must never be removed through this tool. The extension is
 * mounted on the customer detail page, which also renders for staff members, so
 * the flow checks this before fetching or mutating anything and refuses to
 * proceed for a staff account.
 */
export const isStaffAccount = (customer: Pick<ResolvedCustomer, "isStaff">) => customer.isStaff;

/**
 * Human-readable customer label for the popup header, falling back to the email
 * when the name fields are empty (e.g. guest-only or already-anonymized users).
 */
export const formatCustomerName = (
  customer: Pick<ResolvedCustomer, "firstName" | "lastName" | "email">,
) => {
  const name = `${customer.firstName} ${customer.lastName}`.trim();

  return name || customer.email;
};
