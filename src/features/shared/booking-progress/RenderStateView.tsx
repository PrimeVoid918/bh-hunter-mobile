import { Box, Button, View } from "@gluestack-ui/themed";
import {
  TextStyle,
  ViewStyle,
  Text,
  StyleSheet,
  ColorValue,
} from "react-native";
import React from "react";
import { IoniconsIconType } from "@/constants/icons/IonIconsTypes";
import { SimpleLineIconsIcon } from "@/constants/icons/SimpleLineIconsIconTypes";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import CustomIcon, { CustomIconTypesProps } from "@/constants/icons/CustomIcon";
import { BorderRadius, Colors, Spacing } from "@/constants";

export interface RenderStateViewProps {
  onAction: (val: boolean) => void;
  state?: {
    isLocked?: boolean;
    message?: string;
    lockedBgColor?: ColorValue;
    lockedTextColor?: ColorValue;
    icon?: {
      iconProducer: "Ionicons" | "SimpleLineIcons";
      iconName: IoniconsIconType | SimpleLineIconsIcon;
      color?: ColorValue;
      size?: number;
    };
  };
  confirmDisplayMessage?: string;
  confirmButtonStyle?: {
    container?: ViewStyle;
    text?: TextStyle;
  };
  rejectDisplayMessage?: string;
  rejectButtonStyle?: {
    container?: ViewStyle;
    text?: TextStyle;
  };
  lockedStateContent?: React.ReactNode;
  style?: ViewStyle;
}

export default function RenderStateView({
  state = {},
  onAction,
  confirmDisplayMessage = "Confirm",
  rejectDisplayMessage = "Reject",
  confirmButtonStyle = {},
  rejectButtonStyle = {},
  lockedStateContent,
  style,
}: RenderStateViewProps) {
  const handleConfirm = () => {
    onAction(true);
  };

  const handleReject = () => {
    onAction(false);
  };

  const IconComponent =
    state.icon?.iconProducer === "Ionicons"
      ? Ionicons
      : state.icon?.iconProducer === "SimpleLineIcons"
      ? SimpleLineIcons
      : // : state.icon?.iconProducer === "CustomIcon"
        // ? CustomIcon
        null;

  return (
    <>
      <Box
        style={[
          s.unlockedContainer,
          {
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
          },
          style,
          { backgroundColor: state?.lockedBgColor },
        ]}
        display={state.isLocked ? "flex" : "none"}
      >
        {IconComponent && state.icon && (
          <IconComponent
            name={state.icon.iconName as any} // cast if needed
            color={state.icon.color as string} // cast if coming from ColorValue
            size={state.icon.size || 40}
          />
        )}
        <Text style={[s.textColor, { color: state?.lockedTextColor }]}>
          {state?.message}
        </Text>
      </Box>
      <Box
        style={[s.lockedContainer, style]}
        display={state.isLocked ? "none" : "flex"}
      >
        <View>{lockedStateContent}</View>
        <Box style={[s.lockedButtonContainer]}>
          <Button
            style={[
              s.buttons,
              { backgroundColor: "#831919" },
              rejectButtonStyle.container,
            ]}
            onPress={handleReject}
            size="xs" // optional: reduces default inner padding
            variant="solid"
          >
            <Text style={[s.textColor, rejectButtonStyle.text]}>
              {rejectDisplayMessage}
            </Text>
          </Button>
          <Button
            size="xs" // optional: reduces default inner padding
            variant="solid" // or your preferred variant
            style={[
              s.buttons,
              { backgroundColor: "#116a39" },
              confirmButtonStyle.container,
            ]}
            onPress={handleConfirm}
          >
            <Text style={[s.textColor, confirmButtonStyle.text]}>
              {confirmDisplayMessage}
            </Text>
          </Button>
        </Box>
      </Box>
    </>
  );
}

const s = StyleSheet.create({
  unlockedContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,

    // backgroundColor: Colors.
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 1,
  },
  lockedContainer: {
    flexDirection: "column",
    gap: Spacing.sm,
    padding: Spacing.sm,
    // backgroundColor: Colors.
    borderRadius: BorderRadius.md,

    // shadowColor: Colors.
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 4.15,
    shadowRadius: 20,
    elevation: 10,
  },
  lockedButtonContainer: {
    width: "100%",
    // borderWidth: 3,
    // borderColor: "red",
    gap: Spacing.md,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignSelf: "center",
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },

  buttons: {
    alignSelf: "flex-start", // makes it shrink to text width
    paddingHorizontal: Spacing.sm, // your custom spacing
    paddingVertical: Spacing.xs,
    // backgroundColor: Colors.
    justifyContent: "flex-end",
  },

  textColor: {
    // color: Colors.
    fontWeight: "900",
  },
});
