import {
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleProp,
  StyleSheet,
} from "react-native";
import React from "react";
import {
  BorderRadius,
  BorderWidth,
  Colors,
  Fontsize,
  ShadowLight,
  Spacing,
  GlobalStyle,
} from "@/constants";

interface ButtonProps {
  onPressAction?: () => void;
  title?: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  variant?: "primary" | "secondary";
}

const Button = ({
  variant,
  onPressAction,
  title,
  containerStyle,
  textStyle,
  children,
}: ButtonProps) => {
  const variantStyles: Record<string, StyleProp<ViewStyle>> = {
    primary: {
      borderWidth: BorderWidth.md,
      borderRadius: BorderRadius.lg,
      ...ShadowLight.xxl,
      padding: Spacing.sm,
      alignSelf: "stretch",
      width: "100%",
    },
    secondary: {
      borderWidth: BorderWidth.hairline,
      borderRadius: BorderRadius.lg,
      ...ShadowLight.xxl,
      padding: Spacing.sm,
      alignSelf: "stretch",
      width: "100%",
    },
  };

  return (
    <TouchableOpacity
      onPress={onPressAction}
      style={[
        s.defaultStyle,
        variant && variantStyles[variant],
        containerStyle,
      ]}
    >
      {title && (
        <Text style={[GlobalStyle.GenericFont, s.defaultTextStyle, textStyle]}>
          {title}
        </Text>
      )}
      {children}
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  defaultStyle: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 8,
    margin: "auto",
  },
  defaultTextStyle: {
    color: Colors.Text[2],
    fontSize: Fontsize.xl,
    fontWeight: "700",
  },
});

export default Button;
