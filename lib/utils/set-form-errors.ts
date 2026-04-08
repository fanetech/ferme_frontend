import type { UseFormReturn } from "react-hook-form";

/**
 * Sets backend validation errors on react-hook-form fields.
 * Backend returns: { success: false, data: { fieldName: "error message" } }
 */
export function setApiErrors(form: UseFormReturn<any>, error: any) {
  const fieldErrors = error?.response?.data?.data;
  if (fieldErrors && typeof fieldErrors === "object") {
    Object.entries(fieldErrors).forEach(([field, message]) => {
      if (typeof message === "string") {
        form.setError(field, { type: "server", message });
      }
    });
    return true; // errors were set
  }
  return false; // no field errors found
}
