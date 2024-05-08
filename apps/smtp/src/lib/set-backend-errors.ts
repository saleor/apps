import { TRPCClientErrorLike } from "@trpc/client";
import { AppRouter } from "../modules/trpc/trpc-app-router";
import { FieldValues, UseFormSetError } from "react-hook-form";

type SetBackendErrorsProps<T extends FieldValues = FieldValues> = {
  error: TRPCClientErrorLike<AppRouter>;
  setError?: UseFormSetError<T>;
  notifyError: (title: string, text?: string, apiMessage?: string) => void;
};

export function setBackendErrors<T extends FieldValues = FieldValues>({
  error,
  setError,
  notifyError,
}: SetBackendErrorsProps<T>) {
  let isFieldErrorSet = false;
  const fieldErrors = error.data?.zodError?.fieldErrors || {};

  for (const fieldName in fieldErrors) {
    for (const message of fieldErrors[fieldName] || []) {
      isFieldErrorSet = true;
      if (!!setError) {
        setError(fieldName as keyof UseFormSetError<T>, {
          type: "manual",
          message,
        });
      }
    }
  }
  const formErrors = error.data?.zodError?.formErrors || [];
  const formErrorMessage = formErrors.length ? formErrors.join("\n") : undefined;

  notifyError(
    "Could not save the configuration",
    isFieldErrorSet ? "Submitted form contain errors" : error.message,
    formErrorMessage,
  );
}
