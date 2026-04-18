import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator, useTheme } from "react-native-paper";

import OwnerTabs from "./owner.tabs";

import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { refreshAccessStatusThunk } from "@/infrastructure/access/access.redux.thunk";
import { selectAccessStatus } from "@/infrastructure/access/access.redux.slice";
import { AppDispatch } from "@/application/store/stores";

export default function OwnerRootNavigation() {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const { id: ownerId } = useDynamicUserApi();

  const accessData = useSelector(selectAccessStatus);
  const [loading, setLoading] = React.useState(!accessData);

  useEffect(() => {
    const syncAccess = async () => {
      if (ownerId) {
        await dispatch(
          refreshAccessStatusThunk({
            userId: ownerId,
            role: "OWNER",
          }),
        );
        setLoading(false);
      }
    };

    syncAccess();
  }, [ownerId, dispatch]);

  if (loading && !accessData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <OwnerTabs />;
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
