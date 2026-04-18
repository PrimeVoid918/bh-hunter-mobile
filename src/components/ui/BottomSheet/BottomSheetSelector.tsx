import React from "react";
import { StyleSheet } from "react-native";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  ActionsheetItem,
  ActionsheetItemText,
  VStack,
} from "@gluestack-ui/themed";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

interface BottomSheetSelectorProps<T extends string> {
  options: SelectOption<T>[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: T) => void;
  title?: string;
}

export default function BottomSheetSelector<T extends string>({
  options = [],
  isOpen,
  onClose,
  onSelect,
  title,
}: BottomSheetSelectorProps<T>) {
  const { colors } = useTheme();

  const handleSelect = (value: T) => {
    ReactNativeHapticFeedback.trigger("impactLight");
    onSelect(value);
    onClose();
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose} zIndex={999}>
      <ActionsheetBackdrop />
      <ActionsheetContent style={s.content}>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator style={s.indicator} />
        </ActionsheetDragIndicatorWrapper>

        {title && (
          <VStack style={s.header}>
            <ActionsheetItemText style={s.headerText}>
              {title}
              asdasd
            </ActionsheetItemText>
          </VStack>
        )}

        <VStack style={s.listContainer}>
          {options.map((option) => (
            <ActionsheetItem
              key={option.value}
              onPress={() => handleSelect(option.value)}
              style={s.item}
            >
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={20}
                color={colors.outlineVariant}
                style={{ marginRight: 12 }}
              />
              <ActionsheetItemText style={s.itemText}>
                {option.label}
              </ActionsheetItemText>
            </ActionsheetItem>
          ))}
        </VStack>
      </ActionsheetContent>
    </Actionsheet>
  );
}

const s = StyleSheet.create({
  content: {
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
  },
  indicator: {
    backgroundColor: "#E0E0E5",
    width: 40,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F5",
    width: "100%",
    alignItems: "center",
  },
  headerText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#1A1A1A",
  },
  listContainer: {
    width: "100%",
    paddingTop: 8,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    // Standard M3 item height feel
  },
  itemText: {
    fontFamily: "Poppins-Medium",
    fontSize: 15,
    color: "#4A4A4A",
  },
});
