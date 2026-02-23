import React from "react";
import { Controller } from "react-hook-form";
import { View, StyleSheet, TextStyle, ViewStyle } from "react-native";
import {
  TextInput,
  Text,
  useTheme,
  TextInputProps as PaperInputProps,
} from "react-native-paper";

/** * Defines the layout behavior of the input field.
 * 'singleLine': Standard height (baked-in 40px if no label).
 * 'paragraph': Expands vertically to accommodate multiple lines of text.
 */
export type InputType = "singleLine" | "paragraph";

export type FormFieldProps = {
  /** The unique key for the form field (must match your Zod/Hook-Form schema). */
  name: string;
  /** The control object from useForm(). */
  control: any;
  /** Toggles between the interactive TextInput and the read-only display View. */
  isEditing: boolean;
  /** The floating label (Editing) or header label (Display). If omitted in singleLine mode, height collapses to 40px. */
  label?: string;
  /** Ghost text shown when the input is empty. */
  placeholder?: string;
  /** Static text prefix (e.g., '₱', '+63'). */
  prefix?: string;
  /** Static text suffix (e.g., '/mo', 'kg'). */
  suffix?: string;
  /** Sets single-line behavior or multi-line expansion. Defaults to 'singleLine'. */
  inputType?: InputType;
  /** Reduces vertical padding for a more compact M3 look. Defaults to true. */
  dense?: boolean;
  /** Styles applied to the internal text container. Useful for custom inner padding. */
  contentStyle?: ViewStyle;
  /** Styles for the outermost View wrapper. Use this for margins and layout positioning. */
  containerStyle?: ViewStyle;
  /** Styles for the TextInput surface itself. Baked-in: transparent background. */
  inputStyle?: ViewStyle;
  /** Styles for the M3 border outline. Baked-in: 8px borderRadius. */
  outlineStyle?: ViewStyle;
  /** Text style for the read-only 'view' mode. */
  textStyle?: TextStyle;
  /** Label style for the read-only 'view' mode. */
  labelStyle?: TextStyle;
  /** Standard React Native keyboard types. */
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  /** Spread any additional React Native Paper TextInput props not explicitly covered. */
  inputProps?: Partial<PaperInputProps>;
};

/**
 * A highly flexible, Material Design 3-compliant FormField integrated with React Hook Form.
 * * Features "Baked-in" logic:
 * - **Dynamic Height**: If `inputType` is 'singleLine' and no `label` is provided, height snaps to 40px.
 * - **Visual Consistency**: Alignments are adjusted to ensure text doesn't "jump" when toggling `isEditing`.
 * - **M3 Optimization**: Uses Paper's Affix and Outline systems for a native Google UI feel.
 * * @example
 * <FormField
 * name="price"
 * label="Monthly Rent"
 * prefix="₱"
 * control={control}
 * isEditing={isEditing}
 * keyboardType="numeric"
 * />
 */
export function FormField({
  name,
  control,
  isEditing,
  label,
  placeholder,
  prefix,
  suffix,
  inputType = "singleLine",
  dense = true,
  contentStyle,
  containerStyle,
  inputStyle,
  outlineStyle,
  textStyle,
  labelStyle,
  keyboardType = "default",
  inputProps,
}: FormFieldProps) {
  const theme = useTheme();

  // Extract font size from injected styles to determine if we need to expand
  const injectedInputFontSize = StyleSheet.flatten(inputStyle)
    ?.fontSize as number;
  const injectedTextFontSize = StyleSheet.flatten(textStyle)
    ?.fontSize as number;

  // Use the larger of the two to determine the container "breathing room"
  const currentFontSize = injectedInputFontSize || injectedTextFontSize || 16;

  const isTight = inputType === "singleLine";

  /**
   * BAKED-IN DYNAMIC LOGIC:
   * If there is no label, we calculate height based on font size.
   * We add roughly 12-16px of vertical space (6-8px top/bottom)
   * to ensure the M3 border doesn't touch the text.
   */
  const calculatedHeight = !label && isTight ? currentFontSize + 16 : undefined;

  // Fallback to our 40px standard if the font is small, otherwise use calculated
  const dynamicHeight = calculatedHeight
    ? Math.max(40, calculatedHeight)
    : undefined;

  const sharedHorizontalPadding =
    (contentStyle?.paddingHorizontal as number) ?? 12;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const valueStr = value !== undefined ? String(value) : "";

        return (
          <View style={[styles.baseWrapper, containerStyle]}>
            {isEditing ? (
              <TextInput
                mode="outlined"
                dense={dense}
                label={label}
                placeholder={placeholder}
                value={valueStr}
                onChangeText={onChange}
                error={!!error}
                keyboardType={keyboardType}
                multiline={inputType === "paragraph"}
                numberOfLines={inputType === "paragraph" ? 3 : 1}
                left={prefix ? <TextInput.Affix text={prefix} /> : null}
                right={suffix ? <TextInput.Affix text={suffix} /> : null}
                contentStyle={[
                  {
                    paddingVertical: 0,
                    height: dynamicHeight,
                    textAlignVertical: "center",
                    fontSize: currentFontSize, // Sync font
                  },
                  contentStyle,
                ]}
                style={[
                  styles.inputBg,
                  isTight && {
                    height: dynamicHeight,
                    minHeight: dynamicHeight,
                  },
                  inputStyle,
                ]}
                outlineStyle={[
                  { borderRadius: 8 },
                  isTight && { height: dynamicHeight },
                  outlineStyle,
                ]}
                {...inputProps}
              />
            ) : (
              <View
                style={[
                  styles.displayContainer,
                  {
                    paddingHorizontal: prefix ? 0 : sharedHorizontalPadding,
                    minHeight: dynamicHeight,
                  },
                ]}
              >
                {/* label logic... */}
                <Text
                  variant="bodyLarge"
                  style={[
                    styles.displayText,
                    {
                      fontSize: currentFontSize,
                      lineHeight: currentFontSize * 1.2,
                      textAlignVertical: "center",
                    },
                    textStyle,
                  ]}
                >
                  {prefix}
                  {valueStr || "-"}
                  {suffix}
                </Text>
              </View>
            )}

            {isEditing && error && (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.error, marginTop: 4 }}
              >
                {error.message}
              </Text>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  baseWrapper: {
    flexShrink: 1,
    flexGrow: 1,
  },
  inputBg: {
    backgroundColor: "transparent",
  },
  displayContainer: {
    justifyContent: "center",
  },
  displayText: {
    minHeight: 24,
  },
});
