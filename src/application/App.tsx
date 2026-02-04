import "react-native-reanimated";
import * as React from "react";
import { Provider } from "react-redux";
import RootNavigation from "./navigation/RootNavigation";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { store } from "./store/stores";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import Purchases from "react-native-purchases";
import { GlobalDecisionModalProvider } from "@/components/ui/FullScreenDecisionModal";
import { GlobalImageFullScreenProvider } from "../components/ui/ImageComponentUtilities/GlobalImageFullScreenProvider";
import { PortalProvider, PortalHost } from "@gorhom/portal";
import { GlobalEditStateContextSwitcherButtonsProvider } from "@/components/ui/Portals/GlobalEditStateContextSwitcherButtonsProvider";

import { LogBox } from "react-native";
import GlobalDocumentFullScreenProvider from "@/components/ui/DocumentComponentUtilities/GlobalDocumentFullScreenProvider";

export default function App() {
  // Initialize RevenukeCat
  // useEffect(() => {
  //   Purchases.configure({
  //     apiKey: "YOUR_REVENUECAT_PUBLIC_API_KEY",
  //     appUserID: null, // optional
  //   });

  //   // Enable debug logs in dev builds
  //   if (__DEV__) {
  //     Purchases.setDebugLogsEnabled(true);
  //     console.log("RevenueCat debug logs enabled");
  //   }
  // }, []);

  // LogBox.ignoreAllLogs(true);

  return (
    <PortalProvider>
      <GestureHandlerRootView style={{ flex: 1, position: "relative" }}>
        <Provider store={store}>
          <GluestackUIProvider config={config}>
            <GlobalDecisionModalProvider>
              <GlobalImageFullScreenProvider>
                <GlobalDocumentFullScreenProvider>
                  <GlobalEditStateContextSwitcherButtonsProvider>
                    <RootNavigation />
                    <PortalHost name="EditContextSwitchingPortal" />
                    <PortalHost name="ImageFullScreenPortalRoot" />
                    <PortalHost name="DocumentFullScreenPortalRoot" />
                  </GlobalEditStateContextSwitcherButtonsProvider>
                </GlobalDocumentFullScreenProvider>
              </GlobalImageFullScreenProvider>
            </GlobalDecisionModalProvider>
          </GluestackUIProvider>
        </Provider>
      </GestureHandlerRootView>
    </PortalProvider>
  );

  // return <TestModal></TestModal>;
}
