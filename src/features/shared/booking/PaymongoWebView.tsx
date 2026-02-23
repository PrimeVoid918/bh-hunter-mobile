import React, { useState } from "react";
import { View, StyleSheet, Modal } from "react-native";
import { WebView } from "react-native-webview";
import { Appbar, ActivityIndicator, useTheme } from "react-native-paper";

type PayMongoWebViewProps = {
  visible: boolean;
  checkoutUrl: string;
  onClose: () => void;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function PayMongoWebView({
  visible,
  checkoutUrl,
  onClose,
  onSuccess,
  onCancel,
}: PayMongoWebViewProps) {
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    if (url.startsWith("bhhunter://success")) {
      onSuccess();
    } else if (url.startsWith("bhhunter://cancel")) {
      onCancel();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Appbar.Header elevated>
          <Appbar.BackAction onPress={onClose} />
          <Appbar.Content title="Secure Payment" />
        </Appbar.Header>

        <View style={{ flex: 1 }}>
          <WebView
            source={{ uri: checkoutUrl }}
            onLoadEnd={() => setLoading(false)}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState
            renderLoading={() => <></>} // We use our own loader below
          />

          {loading && (
            <View style={StyleSheet.absoluteFill}>
              <View
                style={[
                  styles.loaderContainer,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
