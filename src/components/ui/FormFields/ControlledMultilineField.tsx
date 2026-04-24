import React, { useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import {
  HelperText,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type ControlledMultilineFieldProps = {
  name: string;
  control: any;
  isEditing: boolean;
  label: string;
  placeholder?: string;
  helperText?: string;
  minHeight?: number;
  maxHeight?: number;
  important?: boolean;
  showCount?: boolean;
  maxLength?: number;
  emptyViewText?: string;
};

export default function ControlledMultilineField({
  name,
  control,
  isEditing,
  label,
  placeholder,
  helperText,
  minHeight = 140,
  maxHeight = 260,
  important = false,
  showCount = true,
  maxLength,
  emptyViewText = "No content added yet.",
}: ControlledMultilineFieldProps) {
  const theme = useTheme();
  const [inputHeight, setInputHeight] = useState(minHeight);

  const accent = useMemo(
    () => (important ? "#E7C85A" : theme.colors.outlineVariant),
    [important, theme.colors.outlineVariant],
  );

  const accentBg = important ? "#FFFDF7" : theme.colors.surface;

  return (
    <Controller
      control={control}
      name={name}
      defaultValue=""
      shouldUnregister={false}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const textValue = typeof value === "string" ? value : "";
        const count = textValue.length;

        return (
          <View style={styles.wrapper}>
            <View style={styles.headerRow}>
              <Text style={styles.label}>{label}</Text>

              <View style={styles.headerRight}>
                {!isEditing && (
                  <View style={styles.modeBadge}>
                    <MaterialCommunityIcons
                      name="eye-outline"
                      size={14}
                      color="#4A4A4A"
                    />
                    <Text style={styles.modeBadgeText}>View</Text>
                  </View>
                )}

                {important && (
                  <View style={styles.badge}>
                    <MaterialCommunityIcons
                      name="alert-circle-outline"
                      size={14}
                      color="#7A5A00"
                    />
                    <Text style={styles.badgeText}>Important</Text>
                  </View>
                )}
              </View>
            </View>

            {isEditing ? (
              <TextInput
                key={`${name}-edit`}
                mode="outlined"
                value={textValue}
                onChangeText={onChange}
                placeholder={placeholder}
                multiline
                dense={false}
                // editable={isEditing}
                // disabled={!isEditing}
                // autoFocus={isEditing}
                // selectTextOnFocus={isEditing}
                editable={isEditing}
                disabled={!isEditing}
                blurOnSubmit={false}
                error={!!error}
                maxLength={maxLength}
                scrollEnabled={inputHeight >= maxHeight}
                onContentSizeChange={(e) => {
                  const nextHeight = Math.min(
                    maxHeight,
                    Math.max(minHeight, e.nativeEvent.contentSize.height + 28),
                  );
                  setInputHeight(nextHeight);
                }}
                style={[
                  styles.input,
                  {
                    height: inputHeight,
                    backgroundColor: accentBg,
                  },
                ]}
                outlineStyle={[
                  styles.outline,
                  {
                    borderColor: accent,
                    borderWidth: important ? 1.5 : 1,
                  },
                ]}
                contentStyle={styles.content}
                theme={{
                  colors: {
                    primary: important ? "#C79B12" : theme.colors.primary,
                  },
                }}
              />
            ) : (
              <Surface
                key={`${name}-view`}
                elevation={0}
                style={[
                  styles.viewBox,
                  {
                    minHeight,
                    backgroundColor: theme.colors.surface,
                    borderColor: accent,
                  },
                ]}
              >
                <Text
                  style={[styles.viewText, !textValue && styles.emptyViewText]}
                >
                  {textValue || emptyViewText}
                </Text>
              </Surface>
            )}

            <View style={styles.metaRow}>
              <Text style={styles.helper}>
                {error?.message
                  ? error.message
                  : helperText ||
                    "Write the rules exactly as tenants should read them before booking."}
              </Text>

              {showCount && (
                <Text style={styles.count}>
                  {count}
                  {maxLength ? `/${maxLength}` : ""}
                </Text>
              )}
            </View>

            {!!error && (
              <HelperText type="error" visible>
                {error.message}
              </HelperText>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  headerRow: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    color: "#1A1A1A",
    flex: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FFF3C4",
    borderWidth: 1,
    borderColor: "#E7C85A",
  },
  badgeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 11,
    color: "#7A5A00",
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },
  modeBadgeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 11,
    color: "#4A4A4A",
  },
  input: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
  outline: {
    borderRadius: 12,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 2,
    textAlignVertical: "top",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    lineHeight: 20,
  },
  viewBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "flex-start",
  },
  viewText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    lineHeight: 20,
    color: "#1A1A1A",
  },
  emptyViewText: {
    color: "#9A9A9A",
    fontStyle: "italic",
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  helper: {
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    lineHeight: 17,
    color: "#7A6A2A",
  },
  count: {
    fontFamily: "Poppins-Medium",
    fontSize: 11,
    color: "#9A9A9A",
  },
});
