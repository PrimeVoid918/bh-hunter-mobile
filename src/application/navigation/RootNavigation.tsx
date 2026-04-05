import { StatusBar } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import { useDispatch, useSelector } from "react-redux";

// Navigators
import AuthStack from "@/features/auth/navigation/auth.stack";
import AdminTabs from "@/features/admin/navigation/admin.tabs";
import OwnerTabs from "@/features/owner/navigation/owner.tabs";
import TenantRoot from "@/features/tenant/navigation/tenant.root-navigation";

// Logic & UI
import { RootStackParamList } from "../../features/types/navigation";
import { navigationRef } from "./navigationRef";
import { useValidateJwtTokenQuery } from "@/infrastructure/auth/auth.redux.api";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { login, logout } from "@/infrastructure/auth/auth.redux.slice";
import { AppDispatch, RootState } from "../store/stores";

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { fetchAndSelect } = useDynamicUserApi();

  const auth = useSelector((state: RootState) => state.auth);

  const [bootstrapDone, setBootstrapDone] = React.useState<boolean>(false);
  const [bootstrapToken, setBootstrapToken] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("token");
        const storedRole = await SecureStore.getItemAsync("role");
        const storedUserId = await SecureStore.getItemAsync("userId");

        if (storedToken && storedRole && storedUserId) {
          dispatch(
            login({
              token: storedToken,
              userData: { id: +storedUserId, role: storedRole },
            }),
          );
          setBootstrapToken(storedToken);
        }
      } catch (e) {
        console.error("Bootstrap error", e);
      } finally {
        setBootstrapDone(true);
      }
    };
    bootstrapAuth();
  }, [dispatch]);

  const { data, isLoading, isFetching, error, isSuccess } =
    useValidateJwtTokenQuery(
      { token: bootstrapToken! },
      { skip: !bootstrapDone },
    );

  React.useEffect(() => {
    if (isSuccess && data?.userId) {
      fetchAndSelect(+data.userId);
    } else if (error) {
      handleLogout();
    }
  }, [data, isSuccess, error]);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("role");
    await SecureStore.deleteItemAsync("userId");
    dispatch(logout());
  };

  const isChecking = auth.token && (isLoading || isFetching);
  if (!bootstrapDone || isChecking) {
    return <FullScreenLoaderAnimated />;
  }

  const rawRole = auth.userData?.role;
  const normalizedRole = rawRole
    ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase()
    : null;

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle="light-content" />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!auth.token || !normalizedRole ? (
          <RootStack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            {normalizedRole === "Admin" && (
              <RootStack.Screen name="Admin" component={AdminTabs} />
            )}
            {normalizedRole === "Owner" && (
              <RootStack.Screen name="Owner" component={OwnerTabs} />
            )}
            {normalizedRole === "Tenant" && (
              <RootStack.Screen name="Tenant" component={TenantRoot} />
            )}
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
