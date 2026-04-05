import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator, useTheme } from "react-native-paper";

import TenantTabs from "./tenant.tabs";
import { useLazyGetAccessStatusQuery } from "@/infrastructure/tenants/tenant.redux.api";
import { setAccessStatus } from "@/infrastructure/tenants/tenant.access.redux.slice";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";

export default function TenantRoot() {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { id: tenantId } = useDynamicUserApi();

  const [trigger, { data, isFetching }] = useLazyGetAccessStatusQuery();

  useEffect(() => {
    if (tenantId) {
      trigger(tenantId);
    }
  }, [tenantId]);

  useEffect(() => {
    if (data) {
      dispatch(setAccessStatus(data));
    }
  }, [data]);

  // if (!tenantId || isFetching || !data) {
  //   return (
  //     <View style={styles.loaderContainer}>
  //       <ActivityIndicator size="large" color={theme.colors.primary} />
  //     </View>
  //   );
  // }

  // return <TenantTabs />;

  // return (
  //   <View style={{ flex: 1 }}>
  //     <TenantTabs />
  //     {(isFetching || !data) && (
  //       <View style={styles.loaderOverlay}>
  //         {/* <ActivityIndicator size="large" color={theme.colors.primary} /> */}
  //       </View>
  //     )}
  //   </View>
  // );
  if (!data && isFetching) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <TenantTabs />;
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
