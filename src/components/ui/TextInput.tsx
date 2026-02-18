import {
  View,
  Text,
  TextInput as TI,
  StyleProp,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import React from "react";
import {
  BorderRadius,
  BorderWidth,
  Colors,
  Fontsize,
  ShadowLight,
  Spacing,
} from "@/constants";
import { Ionicons } from "@expo/vector-icons";

interface TextInputProps extends React.ComponentProps<typeof TI> {
  label?: string;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  textInputStyle?: StyleProp<TextStyle>;
  variant?: "primary" | "secondary";
  iconName?: string;
  iconStyle?: StyleProp<TextStyle>;
  secureTextEntry?: boolean;
  iconSize?: number;
}

const TextInput = ({
  iconSize = 30,
  iconStyle,
  iconName,
  variant,
  label,
  placeholder,
  containerStyle,
  labelStyle,
  secureTextEntry = false,
  textInputStyle,
  ...TextInputProps
}: TextInputProps) => {
  const variantStyles: Record<string, StyleProp<ViewStyle>> = {
    primary: {
      backgroundColor: 'transparent',
      borderRadius: BorderRadius.lg,
      // ...ShadowLight.xxl,
      padding: Spacing.xs,
      alignSelf: "stretch",
    },
    secondary: {
      borderWidth: BorderWidth.hairline,
      borderRadius: BorderRadius.lg,
      ...ShadowLight.xxl,
      padding: Spacing.xs,
      alignSelf: "stretch",
    },
  };

  return (
    <View
      style={[
        s.defaultStyle,
        variant && variantStyles[variant],
        containerStyle,
      ]}
    >
      {label && <Text style={[s.defaultLabelStyle, labelStyle]}>{label}</Text>}
      <View style={s.inputRow}>
        {iconName && (
          <Ionicons
            name={iconName as any}
            style={[textInputStyle, s.icon, iconStyle]}
            size={iconSize}
          >
            {label}
          </Ionicons>
        )}
        <TI
          style={[s.defaultTextInputStyle, textInputStyle]}
          placeholder={placeholder ?? ""}
          {...TextInputProps}
          secureTextEntry={secureTextEntry}
        />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  defaultStyle: {
    margin: 0,
    padding: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  icon: {
    fontSize: Fontsize.xxl,
  },
  defaultLabelStyle: {
    margin: 0,
    padding: 0,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  defaultTextInputStyle: {
    flex: 1,
    // borderColor: 'red',
    // borderWidth: 2,
  },
});

export default TextInput;
