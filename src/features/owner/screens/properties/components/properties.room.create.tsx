import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Text, Button, Card, Avatar, useTheme, IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import PropertiesRoomCreateModal from "./properties.room.create.modal";
import { Spacing, BorderRadius, Fontsize } from "@/constants";
import { CreateRoomInput } from "@/infrastructure/room/rooms.schema";
import { PropertiesRoomCreateProps } from "../types/property.types";

export default function PropertiesRoomCreate({
  rooms,
  setRooms,
}: PropertiesRoomCreateProps) {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setModalVisible(true);
  };

  const handleRemove = (index: number) => {
    const updated = [...rooms];
    updated.splice(index, 1);
    setRooms(updated);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
          Property Rooms
        </Text>
        <Button
          mode="contained-tonal"
          icon="plus"
          onPress={handleOpenAdd}
          compact
        >
          Add Room
        </Button>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.listContent}
      >
        {rooms.length === 0 ? (
          <View style={s.emptyState}>
            <Text variant="bodySmall" style={{ opacity: 0.6 }}>
              No rooms added yet.
            </Text>
          </View>
        ) : (
          rooms.map((room, index) => (
            <Card
              key={index}
              style={s.roomCard}
              onPress={() => handleOpenEdit(index)}
            >
              <Card.Title
                title={`Room ${room.roomNumber}`}
                subtitle={`₱${room.price} • ${room.maxCapacity} Pax`}
                left={(props) => (
                  <Avatar.Icon
                    {...props}
                    icon={room.thumbnail?.[0] ? "door-open" : "home-outline"}
                    size={40}
                  />
                )}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="close-circle"
                    onPress={() => handleRemove(index)}
                  />
                )}
              />
            </Card>
          ))
        )}
      </ScrollView>

      <PropertiesRoomCreateModal
        visible={modalVisible}
        initialData={editingIndex !== null ? rooms[editingIndex] : undefined}
        onClose={() => setModalVisible(false)}
        onSubmit={(data) => {
          if (editingIndex !== null) {
            const updated = [...rooms];
            updated[editingIndex] = data;
            setRooms(updated);
          } else {
            setRooms([...rooms, data]);
          }
          setModalVisible(false);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginTop: Spacing.md },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  listContent: { gap: 12, paddingBottom: 8 },
  roomCard: { width: 200, borderRadius: BorderRadius.md },
  emptyState: {
    width: "100%",
    padding: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
});
