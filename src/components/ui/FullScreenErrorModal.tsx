import React from "react";
import { StyleSheet } from "react-native";
import { Portal, Dialog, Paragraph, Button } from "react-native-paper";

interface FullScreenErrorModalProps {
  visible: boolean;
  message?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

export default function FullScreenErrorModal({
  visible,
  message = "Failed to fetch details.",
  onRetry,
  onCancel,
}: FullScreenErrorModalProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel} style={styles.dialog}>
        <Dialog.Title>Error</Dialog.Title>
        <Dialog.Content>
          <Paragraph>{message}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          {onRetry && <Button onPress={onRetry}>Retry</Button>}
          <Button onPress={onCancel}>Cancel</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: "white",
  },
});
