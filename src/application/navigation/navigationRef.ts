// navigation/navigationRef.ts
import { createNavigationContainerRef } from "@react-navigation/native";
import type { TenantTabsParamList } from "@/features/tenant/navigation/tenant.tabs.types";

export const navigationRef =
  createNavigationContainerRef<TenantTabsParamList>();

// generic navigate helper
export function navigate(
  name: keyof TenantTabsParamList,
  params?: TenantTabsParamList[keyof TenantTabsParamList],
) {
  if (navigationRef.isReady()) {
    // cast to 'any' to satisfy nested navigator typing
    navigationRef.navigate(name as any, params as any);
  }
}
