import { View, StyleSheet } from "react-native";
import React from "react";
import { Icon, Surface, useTheme, Text } from "react-native-paper";
import Markdown from "react-native-markdown-display";

export default function PlatformGuidelines() {
  const theme = useTheme();
  const styles = markdownStyles(theme);

  const rules =
    `This platform is a matchmaking tool connecting tenants and boarding house owners.
* Tenants compete to secure rooms and owners compete to attract tenants.
* Booking through this system **only logs a reservation intent**.
* Final arrangements, payments, and agreements occur directly between the tenant and owner.
* Advance payments can be done via the system (optional).`.trim();

  //TODO: Add refund policy
  return (
    <Surface
      elevation={0}
      style={[
        s.infoSurface,
        { backgroundColor: theme.colors.primaryContainer },
      ]}
    >
      <View style={s.infoHeader}>
        <Icon
          source="information-outline"
          size={20}
          color={theme.colors.onPrimaryContainer}
        />
        <Text
          variant="labelLarge"
          style={{
            color: theme.colors.onPrimaryContainer,
            fontWeight: "700",
          }}
        >
          Platform Guidelines
        </Text>
      </View>

      <Markdown style={styles}>{rules}</Markdown>
    </Surface>
  );
}

const s = StyleSheet.create({
  infoSurface: {
    padding: 16,
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
});

const markdownStyles = (theme: any) => ({
  body: {
    color: theme.colors.onPrimaryContainer,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
  },
  bullet_list: {
    marginTop: 4,
  },
  list_item: {
    marginBottom: 4,
  },
  bullet_list_icon: {
    color: theme.colors.onPrimaryContainer,
    marginRight: 10,
    fontWeight: "bold",
  },
  strong: {
    color: theme.colors.onPrimaryContainer,
    fontWeight: "800" as const,
  },
  text: {
    color: theme.colors.onPrimaryContainer,
  },
});
