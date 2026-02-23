import React, { useEffect, useRef } from "react";
import { View, Animated, Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalBottomNavigationStyles } from "@/constants/GlobalStyle";
import { BorderRadius } from "@/constants";

interface CustomTabIconProps {
  name: string;
  focused: boolean;
  color: string;
}

export const CustomTabIcon = ({ name, focused, color }: CustomTabIconProps) => {
  const liftAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(liftAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // marginTop cannot use native driver
    }).start();
  }, [focused]);

  const marginTop = liftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      GlobalBottomNavigationStyles.iconLiftHeightWhenNotFocused,
      GlobalBottomNavigationStyles.iconLiftHeightWhenFocused,
    ],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          marginTop,
          borderColor: focused
            ? GlobalBottomNavigationStyles.containerIconActiveColor
            : GlobalBottomNavigationStyles.containerIconInactiveColor,
          backgroundColor: GlobalBottomNavigationStyles.iconBackgroundColor,
        },
      ]}
    >
      <Ionicons
        name={name}
        size={GlobalBottomNavigationStyles.iconSize}
        color={color}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
    height: GlobalBottomNavigationStyles.iconHeight,
    // padding: 8,
    borderRadius: BorderRadius.md, // pill-like
    borderWidth: GlobalBottomNavigationStyles.iconBorderWidth,
    justifyContent: "center",
    alignItems: "center",
    // Shadow for Material You lift effect
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
