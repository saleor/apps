import { useHasAppAccess as useHasAppAccessLib } from "@saleor/apps-shared/use-has-app-access";

import { REQUIRED_CLIENT_PERMISSIONS } from "@/lib/required-client-permissions";

export const useHasAppAccess = () => useHasAppAccessLib(REQUIRED_CLIENT_PERMISSIONS);
