import "react-native-reanimated";
import * as React from "react";
import { Provider } from "react-redux";
import RootNavigation from "./navigation/RootNavigation";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { store } from "./store/stores";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { GlobalImageFullScreenProvider } from "../components/ui/ImageComponentUtilities/GlobalImageFullScreenProvider";
import { PortalProvider, PortalHost } from "@gorhom/portal";
import { GlobalEditStateContextSwitcherButtonsProvider } from "@/components/ui/Portals/GlobalEditStateContextSwitcherButtonsProvider";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";

import { Linking } from "react-native";
// import * as Linking from "expo-linking";
import GlobalDocumentFullScreenProvider from "@/components/ui/DocumentComponentUtilities/GlobalDocumentFullScreenProvider";
import theme from "./config/react-native-paper.config";
import * as Font from "expo-font";
import { useFonts } from "expo-font";
import fonts from "@/constants/themes/fonts";

export default function App() {
  const [fontsLoaded] = useFonts(fonts);

  // LogBox.ignoreAllLogs(true);
  React.useEffect(() => {
    const sub = Linking.addEventListener("url", (event) => {
      console.log("Returned to app with:", event.url);

      if (event.url.includes("payment-success")) {
        console.log("Payment flow finished");
        // Navigate or refetch booking
      }

      if (event.url.includes("payment-cancel")) {
        console.log("Payment cancelled");
      }
    });

    return () => sub.remove();
  }, []);

  if (!fontsLoaded) {
    return null; // or splash screen
  }

  return (
    <PortalProvider>
      <GestureHandlerRootView style={{ flex: 1, position: "relative" }}>
        <Provider store={store}>
          <GluestackUIProvider config={config}>
            <PaperProvider theme={theme}>
              <GlobalImageFullScreenProvider>
                <GlobalDocumentFullScreenProvider>
                  <GlobalEditStateContextSwitcherButtonsProvider>
                    <RootNavigation />
                    <PortalHost name="ImageFullScreenPortalRoot" />
                    <PortalHost name="DocumentFullScreenPortalRoot" />
                  </GlobalEditStateContextSwitcherButtonsProvider>
                </GlobalDocumentFullScreenProvider>
              </GlobalImageFullScreenProvider>
            </PaperProvider>
          </GluestackUIProvider>
        </Provider>
      </GestureHandlerRootView>
    </PortalProvider>
  );

  // return <TestModal></TestModal>;
}
