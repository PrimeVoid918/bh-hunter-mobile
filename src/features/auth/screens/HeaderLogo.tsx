import { BorderRadius, Colors, Fontsize, Spacing } from "@/constants";
import React from "react";
import { Image, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import { SvgXml } from "react-native-svg";

export default function HeaderLogo() {
  const image = require("../../../assets/logo/1_1/dark/dark-128.png");
  // const image = require("../../../assets/logo/1_1/light/light-64.png");
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        backgroundColor: "transparent",
        // backgroundColor: Colors.PrimaryLight[6],
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
      }}
    >
      <View style={{}}>
        <Image source={image} />
      </View>
      <Text
        style={{
          fontSize: Fontsize.display3,
          fontWeight: "900",
          textAlignVertical: "bottom",
        }}
      >
        Hunter
      </Text>
    </View>
  );
}
// export default function HeaderLogo() {
//   const LogoSvg = `
// <svg width="400" height="100" viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
//   <text x="0" y="75" font-family="Poppins, sans-serif" font-weight="900" font-size="60" fill="#357FC1">Boarding House Hunter</text>
// </svg>
// `;
//   return <SvgXml xml={LogoSvg} width="80%" height={80} />;
// }
