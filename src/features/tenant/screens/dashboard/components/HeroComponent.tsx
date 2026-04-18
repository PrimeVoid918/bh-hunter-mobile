import React from "react";
import { StyleSheet, ImageBackground, View } from "react-native";
import { Text, Surface } from "react-native-paper";
import { VStack, Box } from "@gluestack-ui/themed";
import { Spacing, BorderRadius } from "@/constants";

// Using the require method as discussed
const OrmocPlaza = require("../../../../../assets/static/ormoc_plaza.jpg");
// const OrmocPlaza = require("../../assets/static/ormoc_plaza.jpg");

export default function HeroComponent() {
  return (
    <Surface elevation={0} style={s.container}>
      <ImageBackground
        source={OrmocPlaza}
        style={s.bgImage}
        imageStyle={{ borderRadius: BorderRadius.lg }}
      >
        {/* REPLACEMENT FOR LINEAR GRADIENT */}
        <View style={s.overlay}>
          <VStack style={s.content}>
            <Box style={s.tag}>
              <Text style={s.tagText}>📍 ORMOC CITY</Text>
            </Box>
            <Text style={s.title}>Find Your Next Home</Text>
            <Text style={s.subtitle}>
              Secure, verified, and accessible boarding houses in Ormoc.
            </Text>
          </VStack>
        </View>
      </ImageBackground>
    </Surface>
  );
}

const s = StyleSheet.create({
  container: {
    height: 180,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#333",
  },
  bgImage: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "flex-end",
    // This creates a solid-to-transparent fade effect without the native module
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  content: {
    gap: 2,
  },
  tag: {
    backgroundColor: "#FDD85D",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  tagText: {
    fontFamily: "Poppins-Bold",
    fontSize: 10,
    color: "#3A3A3A",
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 22,
    color: "white",
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
  },
});
