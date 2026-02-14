import { Box, HStack, VStack } from "@gluestack-ui/themed";
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import PressableImageFullscreen from "../ImageComponentUtilities/PressableImageFullscreen";
import { BorderRadius, Colors, Fontsize, Spacing } from "@/constants";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  user?: Record<string, any> | null;
  title?: string;
};

export default function UserInformationCard({ user, title }: Props) {
  const userInfo = useMemo(() => {
    if (!user) return null;

    const identity = {
      username: user.username ?? null,
      firstName: user.firstname ?? null,
      lastName: user.lastname ?? null,
    };

    const contact = {
      email: user.email ?? null,
      phone: user.phone_number ?? user.contactNumber ?? null,
    };

    const status = {
      isVerified: user.isVerified ?? user.verificationStatus ?? null,
    };

    console.log("user data in UserInformation: ", user);

    return {
      identity,
      contact,
      status,
    };
  }, [user]);

  if (!userInfo) return null;

  const { identity, contact, status } = userInfo;

  return (
    <HStack style={[s.container]}>
      {title && (
        <Text style={[{ fontWeight: "600", fontSize: 16 }, s.textColor]}>
          {title}
        </Text>
      )}
      <PressableImageFullscreen
        containerStyle={{ height: 100, aspectRatio: 1, borderRadius: "50%" }}
      />
      <VStack>
        <VStack>
          <Text
            style={[s.textColor, { fontSize: Fontsize.xl, fontWeight: "900" }]}
          >
            {identity.firstName} {identity.lastName}
          </Text>
          <Text style={[s.textColor]}>{identity.username}</Text>
        </VStack>

        <VStack style={[{ marginTop: "auto" }]}>
          <HStack style={[s.contact_containerItem]}>
            <Ionicons
              name="mail"
              color={s.textColor.color}
              size={Fontsize.md}
            />
            <Text style={[s.textColor]}>{contact.email}</Text>
          </HStack>
          <HStack style={[s.contact_containerItem]}>
            <Ionicons
              name="call"
              color={s.textColor.color}
              size={Fontsize.md}
            />
            <Text style={[s.textColor]}>{contact.phone}</Text>
          </HStack>
        </VStack>
      </VStack>

      <Box
        style={[
          {
            marginLeft: "auto",
            // borderWidth: 2,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Ionicons
          name={status.isVerified ? "checkmark-circle" : "close-circle"}
          color={status.isVerified ? "green" : "red"}
          size={Fontsize.display2}
        />
        <Text style={[s.textColor]}>
          {status.isVerified ? "Verified" : "Not Verified"}
        </Text>
      </Box>
    </HStack>
  );
}

const s = StyleSheet.create({
  container: {
    gap: 12,
    backgroundColor: Colors.PrimaryLight[7],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },

  contact_containerItem: {
    // borderWidth: 2,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: Spacing.sm,
  },

  textColor: {
    color: Colors.TextInverse[2],
  },
});
