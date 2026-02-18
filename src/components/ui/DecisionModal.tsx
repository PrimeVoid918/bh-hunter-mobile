import React from "react";
import {
  StyleProp,
  StyleSheet,
  ViewProps,
  ViewPropsIOS,
  ViewStyle,
} from "react-native";
import {
  Alert,
  Box,
  Button,
  Text,
  HStack,
  VStack,
  Heading,
  View,
} from "@gluestack-ui/themed";
import { BorderRadius, Colors, Fontsize, Spacing } from "@/constants";
import AutoExpandingInput from "./AutoExpandingInputComponent";

type DecisionModalProps = {
  visible: boolean; // controls if modal shows
  title?: string;
  message?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function DecisionModal({
  visible,
  title = "Confirm",
  message = "Are you sure?",
  onCancel,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  children,
  containerStyle,
}: DecisionModalProps) {
  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <View
        style={[
          {
            borderWidth: 5,
            gap: Spacing.lg,
            alignItems: "center",
            width: "90%",
            maxWidth: 400,
            height: 400,
            padding: Spacing.lg,
            borderRadius: BorderRadius.md,
          },
          containerStyle,
        ]}
      >
        <Heading>
          <Text style={[s.textColor, { fontSize: Fontsize.h1 }]}>{title}</Text>
        </Heading>

        <Box>
          <Text style={s.textColor}>{message}</Text>
          <Box>{children}</Box>
        </Box>

        <HStack>
          <Button mr="$3" action="negative" onPress={onCancel}>
            <Text style={s.textColor}>{cancelText}</Text>
          </Button>
          <Button action="secondary" variant="outline" onPress={onConfirm}>
            <Text style={s.textColor}>{confirmText}</Text>
          </Button>
        </HStack>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  textColor: {
    color: Colors.TextInverse[1],
  },
});
