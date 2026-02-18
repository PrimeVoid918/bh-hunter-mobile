import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useState } from "react";
import { Box, VStack } from "@gluestack-ui/themed";
import { ScrollView } from "react-native-gesture-handler";
import z from "zod";

// form hook
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropertiesRoomCreateProps } from "../types/property.types";
import { Colors, Fontsize, Spacing } from "@/constants";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import {
  CreateRoomInput,
  CreateRoomInputSchema,
} from "../../../../../infrastructure/room/rooms.schema";
import PropertiesRoomCreateModal from "./properties.room.create.modal";
import { Ionicons } from "@expo/vector-icons";

export default function PropertiesRoomCreate({
  rooms,
  setRooms,
}: PropertiesRoomCreateProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);
  // const [editingRoomData, setEditingRoomData] =
  //   useState<CreateRoomInput | null>(null);

  const initialDefaultValues: CreateRoomInput = {
    roomNumber: "",
    maxCapacity: 0,
    price: 0.0,
    tags: [],
    gallery: [],
    thumbnail: [],
  };

  const {
    formState: { errors },
  } = useForm<z.infer<typeof CreateRoomInputSchema>>({
    resolver: zodResolver(CreateRoomInputSchema) as any,
    defaultValues: initialDefaultValues,
  });

  const normalizedRooms = rooms.map((room) => ({
    ...room,
    tags: room.tags ?? [], // ensure it's always an array
    gallery: room.gallery ?? [], // ensure it's always an array
  }));

  return (
    <StaticScreenWrapper>
      <VStack>
        <View
          style={{
            borderBottomColor: "#bbb", // line color
            borderBottomWidth: 1, // line thickness
            marginVertical: 10, // spacing around the line
          }}
        />
        {/* Modal */}
        <PropertiesRoomCreateModal
          visible={modalVisible}
          initialData={
            editingRoomIndex !== null
              ? {
                  ...normalizedRooms[editingRoomIndex],
                  index: editingRoomIndex,
                }
              : undefined
          }
          onClose={() => {
            setModalVisible(false);
            setEditingRoomIndex(null);
          }}
          onSubmit={(roomData, index) => {
            const normalizedRoom = {
              ...roomData,
              tags: roomData.tags ?? [],
              gallery: roomData.gallery ?? [],
            };

            if (index !== undefined) {
              const updatedRooms = [...rooms];
              updatedRooms[index] = normalizedRoom;
              setRooms(updatedRooms);
            } else {
              setRooms([...rooms, normalizedRoom]);
            }

            setModalVisible(false);
            setEditingRoomIndex(null);
          }}
        />

        <Text style={[s.Form_Label]}>Add Rooms</Text>
        <View style={{ alignItems: "flex-start", marginBottom: Spacing.lg }}>
          <Pressable
            style={({ pressed }) => ({
              padding: 10,
              borderRadius: 10,
              opacity: pressed ? 0.8 : 1,
              flexDirection: "row",
              gap: 10,
            })}
            onPress={() => {
              setEditingRoomIndex(null); // this means ADD
              // setEditingRoomData(null); // start fresh
              setModalVisible(true);
              console.log("Modal visible?", modalVisible);
            }}
          >
            <Text style={[s.generic_text, { fontSize: Fontsize.md }]}>
              Add Room
            </Text>
            <Ionicons name="add" size={20} color="white" />
          </Pressable>
        </View>
        <ScrollView
          style={{ height: 175 }}
          contentContainerStyle={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "flex-start",
            alignContent: "flex-start",
          }}
        >
          {rooms &&
            rooms.map((room, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  setEditingRoomIndex(index); // mark which room
                  // setEditingRoomData(room); // pass in initial values
                  setModalVisible(true);
                }}
              >
                <RoomItem roomItem={room} />
              </Pressable>
            ))}
        </ScrollView>
      </VStack>
    </StaticScreenWrapper>
  );
}

function RoomItem({ roomItem }: { roomItem: CreateRoomInput }) {
  return (
    <Box
      style={{
        borderColor: "red",
        borderWidth: 3,
        borderRadius: 8,
        padding: 10,
        aspectRatio: 3 / 4,
        height: 175,
      }}
    >
      <Text style={[s.generic_text]}>{roomItem.roomNumber}</Text>
      <Text style={[s.generic_text]}>{roomItem.price}</Text>
      <Text style={[s.generic_text]}>{roomItem.maxCapacity}</Text>
    </Box>
  );
}

const s = StyleSheet.create({
  generic_text: {
    color: Colors.TextInverse[2],
  },
  Form_Label: {
    color: Colors.TextInverse[2],
    fontWeight: "bold",
    fontSize: Fontsize.xxl,
    marginBottom: 6,
  },
  Form_SubLabel: {
    color: Colors.TextInverse[2],
    fontWeight: "bold",
    fontSize: Fontsize.xl,
    marginBottom: 6,
  },
  Form_Input_Placeholder: {
    color: Colors.TextInverse[2],
    fontSize: Fontsize.md,
  },
});
