import React from "react";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
} from "@gluestack-ui/themed";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

interface BottomSheetSelectorProps<T extends string> {
  options: SelectOption<T>[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: T) => void;
}

export default function BottomSheetSelector<T extends string>({
  options = [],
  isOpen,
  onClose,
  onSelect,
}: BottomSheetSelectorProps<T>) {
  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        {options.map((option) => (
          <ActionsheetItem
            key={option.value}
            onPress={() => {
              onSelect(option.value);
              onClose();
            }}
          >
            <ActionsheetItemText>{option.label}</ActionsheetItemText>
          </ActionsheetItem>
        ))}
      </ActionsheetContent>
    </Actionsheet>
  );
}
