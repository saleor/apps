import { AuthData } from "@saleor/app-sdk/APL";

/**
 * Passed from scan function to individual processing unit
 */
export interface ProcessingDto {
  authData: AuthData;
}
