import { Colors, Fontsize } from "@/constants";
import { FormControl, Button, View, HStack } from "@gluestack-ui/themed";
import { Controller } from "react-hook-form";
import { Chip, Text } from "react-native-paper";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

type BottomSheetTriggerFieldProps<T extends string = string> = {
  name: string;
  control: any;
  label?: string;
  options: SelectOption<T>[]; // pass value/label mapping
  isEditing: boolean;
  placeholder?: string;
  error?: string;
  onOpen: () => void;
};

export function BottomSheetTriggerField<T extends string>({
  name,
  control,
  label,
  options,
  isEditing,
  placeholder = "Select",
  error,
  onOpen,
}: BottomSheetTriggerFieldProps<T>) {
  return (
    <FormControl isInvalid={!!error}>
      <Controller
        control={control}
        name={name}
        rules={{ required: `${label} is required` }}
        render={({ field: { value } }) => {
          const selected = options.find((o) => o.value === value);

          return (
            <View>
              {isEditing ? (
                <Button onPress={onOpen}>
                  <Text>{selected?.label ?? placeholder}</Text>
                </Button>
              ) : (
                <HStack style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text>{label ? `${label}: ` : ""}</Text>
                  <Chip onPress={() => console.log("Pressed")}>
                    {selected?.label}
                  </Chip>
                </HStack>
                // <Text
                //   style={{
                //     color: Colors.TextInverse[2],
                //     fontSize: Fontsize.md,
                //   }}
                // >
                //   {label}: {selected?.label ?? "-"}
                // </Text>
              )}
            </View>
          );
        }}
      />
    </FormControl>
  );
}
