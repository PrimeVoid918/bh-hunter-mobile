import React from "react";
import { Controller } from "react-hook-form";
import {
  View,
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
  StyleProp,
  KeyboardTypeOptions,
} from "react-native";
import { Box, Input, InputField } from "@gluestack-ui/themed";
import AutoExpandingInput from "../AutoExpandingInputComponent";
import { Colors } from "@/constants";

export type InputType = "singleLine" | "paragraph";

export type FormFieldProps<T extends string | number | undefined = string> = {
  name: string;
  control: any;
  isEditing: boolean;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  textAffix?: {
    textPrefix?: string;
    textSuffix?: string;
  };
  labelConfig?: {
    label?: string;
    labelStyle?: StyleProp<TextStyle>;
  };
  textOverflow?: {
    ellipsize?: boolean;
    numberOfLines?: number;
  };
  inputConfig?: {
    inputStyle?: TextStyle;
    inputContainerStyle?: ViewStyle;
    inputType?: InputType;
    placeholder?: string;
    keyboardType?: KeyboardTypeOptions;
  };
};
export function FormField<T extends string | number | undefined = string>({
  name,
  control,
  isEditing,
  textStyle,
  containerStyle,
  textAffix,
  labelConfig,
  textOverflow,
  inputConfig,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const valueStr = field.value !== undefined ? String(field.value) : "";

        const inputType = inputConfig?.inputType ?? "singleLine";

        const ellipsize = textOverflow?.ellipsize;
        const numberOfLines = ellipsize
          ? (textOverflow?.numberOfLines ?? 1)
          : undefined;

        return (
          <View style={[styles.container, containerStyle]}>
            {labelConfig?.label && (
              <Text style={labelConfig?.labelStyle}>{labelConfig?.label}</Text>
            )}
            {isEditing ? (
              <View style={[styles.inputRow, inputConfig?.inputContainerStyle]}>
                {textAffix?.textPrefix && (
                  <Text style={styles.affix}>{textAffix.textPrefix}</Text>
                )}

                {inputType === "singleLine" ? (
                  <Input borderWidth={0} backgroundColor="transparent" flex={1}>
                    <InputField
                      value={valueStr}
                      onChangeText={field.onChange as any} //! a problem
                      placeholder={inputConfig?.placeholder ?? ""}
                      style={[styles.input, inputConfig?.inputStyle]}
                    />
                  </Input>
                ) : (
                  <AutoExpandingInput
                    value={valueStr}
                    onChangeText={field.onChange as any} //! a problem
                    placeholder={inputConfig?.placeholder ?? ""}
                    style={[styles.input, inputConfig?.inputStyle]}
                  />
                )}

                {textAffix?.textSuffix && (
                  <Text style={styles.affix}>{textAffix.textSuffix}</Text>
                )}
              </View>
            ) : (
              <Text
                style={[styles.text, textStyle]}
                numberOfLines={numberOfLines}
                ellipsizeMode={ellipsize ? "tail" : undefined}
              >
                {textAffix?.textPrefix}
                {valueStr || "-"}
                {textAffix?.textSuffix}
              </Text>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    minHeight: 40,
    //! justifyContent: "center", //! when uncommented ill affect the ReviewCubmission in create state
    // borderWidth: 3,
    // borderColor: "white",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  affix: {
    fontSize: 16,
    color: Colors.TextInverse[1],
    marginHorizontal: 4,
  },
  input: {
    fontSize: 16,
    color: Colors.TextInverse[1],
  },
  text: {
    fontSize: 16,
    color: Colors.TextInverse[1],
  },
});
