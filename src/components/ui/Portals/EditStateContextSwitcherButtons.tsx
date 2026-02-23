import { Alert, View, StyleSheet, Pressable, Text } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing } from "@/constants";

interface EditStateContextSwitcherButtonsProps {}
interface EditStateContextSwitcherButtonsProps {
  isEditing: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onDiscard?: () => void;
}

export default function EditStateContextSwitcherButtons({
  isEditing,
  onEdit,
  onSave,
  onDiscard,
}: EditStateContextSwitcherButtonsProps) {
  const color = "white";
  const size = 35;

  return (
    <View style={s.container}>
      <View style={s.floatingContainer}>
        {/* Save */}
        <Pressable
          style={[s.item_container, { display: isEditing ? "flex" : "none" }]}
          onPress={onSave}
        >
          <View style={s.icon}>
            <Ionicons name="checkmark-circle" color={color} size={size} />
          </View>
        </Pressable>

        {/* Discard */}
        <Pressable
          style={[s.item_container, { display: isEditing ? "flex" : "none" }]}
          onPress={onDiscard}
        >
          <View style={s.icon}>
            <Ionicons name="close-circle" color={color} size={size} />
          </View>
        </Pressable>

        {/* Edit */}
        <Pressable
          style={[s.item_container, { display: isEditing ? "none" : "flex" }]}
          onPress={onEdit}
        >
          <Text style={s.textColor}>Edit</Text>
          <View style={s.icon}>
            <Ionicons name="create" color={color} size={size} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// nag gama kay button for editing the bh
const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  textColor: {
    color: Colors.TextInverse[2],
  },
  item_container: {
    flexDirection: "row",
    gap: Spacing.md,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
    height: "auto",
  },
  icon: {
    flexDirection: "row",
    gap: Spacing.md,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
    height: "auto",
    elevation: 4, // adds shadow on Android
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, // adds shadow on iOS
  },
});
