import { ExpoConfig, ConfigContext } from "@expo/config";
import type { MapLibrePluginProps } from "@maplibre/maplibre-react-native";
import "dotenv/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "BH Hunter",
  slug: "bh-hunter",
  version: "1.0.0",
  extra: {
    api: {
      baseUrl: `${process.env.EXPO_PUBLIC_BASE_URL}${process.env.EXPO_PUBLIC_BACKEND_PORT}`, // ✅ must be prefixed
    },
    eas: {
      projectId: "f972946f-0577-48b6-bb4d-3eca11be116a", // Ensure projectId is included
    },
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  plugins: [
    "expo-secure-store",
    "expo-sqlite",
    "expo-font",
    [
      "@maplibre/maplibre-react-native",
      {
        // this is suppose to target andriod or ios version for compatibility reasons
        // android: {
        //   nativeVersion: "x.x.x",
        // },
        // ios: {
        //   nativeVersion: "x.x.x",
        // },
      } as MapLibrePluginProps,
    ],
  ],
  scheme: "bhhunter",
});
