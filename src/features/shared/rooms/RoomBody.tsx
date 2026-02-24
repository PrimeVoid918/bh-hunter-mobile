import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { HStack, VStack } from "@gluestack-ui/themed";
import ImageCarousel from "@/components/ui/ImageCarousel";
import { FormField } from "@/components/ui/FormFields/FormField";
import { TagListStateful } from "@/components/ui/AmenitiesAndTagsLists/TagListStateful";
import { BorderRadius, Fontsize, Spacing } from "@/constants";
import {
  FieldErrors,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import TagListDumb from "@/components/ui/AmenitiesAndTagsLists/TagListDumb";
import { Surface, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  FindOneRoom,
  PatchRoomInput,
  RoomFurnishingType,
  RoomType,
} from "@/infrastructure/room/rooms.schema";
import { ROOM_FEATURE_TAGS } from "@/infrastructure/room/rooms.constants";

interface RoomBodyInterface {
  data: FindOneRoom;
  control: any;
  isEditing: boolean;
  onViewRooms: () => void;
  errors: FieldErrors<PatchRoomInput>;
  form: {
    getValues: UseFormGetValues<PatchRoomInput>;
    setValue: UseFormSetValue<PatchRoomInput>;
    watch: UseFormWatch<PatchRoomInput>;
  };
}

export function RoomBodyEdit({
  data,
  control,
  isEditing,
  errors,
  form,
  onViewRooms,
}: RoomBodyInterface) {
  const { colors } = useTheme();

  return (
    <VStack style={s.body}>
      {/* Amenities Section */}
      <Surface style={s.card} elevation={0}>
        <HStack style={s.cardHeader}>
          <MaterialCommunityIcons
            name="layers"
            size={20}
            color={colors.primary}
          />
          <Text style={s.sectionTitle}>Amenities</Text>
        </HStack>
        <TagListStateful
          name="tags"
          items={ROOM_FEATURE_TAGS}
          isEditing={isEditing}
          form={form}
        />
      </Surface>

      <ImageCarousel images={data?.gallery ?? []} />

      {/* Description Section */}
      <Surface style={s.card} elevation={0}>
        <HStack style={s.cardHeader}>
          <MaterialCommunityIcons
            name="information"
            size={20}
            color={colors.primary}
          />
          <Text style={s.sectionTitle}>Description</Text>
        </HStack>
        <FormField
          name="description"
          control={control}
          isEditing={isEditing}
          placeholder="Describe your room..."
        />
      </Surface>
    </VStack>
  );
}
const s = StyleSheet.create({
  body: {
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
  card: {
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#CCCCCC", // outlineVariant
    backgroundColor: "#FFFFFF",
  },
  cardHeader: {
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Fontsize.md,
    fontFamily: "Poppins-SemiBold",
    color: "#1A1A1A",
  },
  label: {
    fontSize: 10,
    fontFamily: "Poppins-Bold",
    color: "#767474", // outline
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    fontSize: Fontsize.md,
    fontFamily: "Poppins-Regular",
    lineHeight: 22,
    color: "#3A3A3A",
  },
});

interface RoomBodyViewInteface {
  mode: "view";
  data: FindOneRoom;
  onViewRooms: () => void;
}

export function RoomBodyView({ data }: RoomBodyViewInteface) {
  const { colors } = useTheme();
  const amenities = data.tags ?? [];

  return (
    <VStack style={s.body}>
      <ImageCarousel images={data?.gallery ?? []} />

      {/* Description Card */}
      <Surface style={s.card} elevation={0}>
        <Text style={s.label}>ABOUT THIS PROPERTY</Text>
        <Text style={s.descriptionText}>
          {data?.description?.trim() ||
            "The owner hasn't provided a description yet."}
        </Text>
      </Surface>

      {/* Amenities Card */}
      <Surface style={s.card} elevation={0}>
        <HStack
          style={{ marginBottom: Spacing.md, alignItems: "center", gap: 8 }}
        >
          <MaterialCommunityIcons
            name="check-all"
            size={18}
            color={colors.success}
          />
          <Text style={s.sectionTitle}>Property Amenities</Text>
        </HStack>
        <TagListDumb
          items={amenities}
          selected={amenities}
          isEditing={false}
          onToggle={() => {}}
        />
      </Surface>
    </VStack>
  );
}

const sView = StyleSheet.create({
  body: { gap: Spacing.xl },
  sectionTitle: {
    fontSize: Fontsize.lg,
    fontWeight: "600",
  },
  descriptionText: {
    fontSize: Fontsize.md,
  },
  amenitiesContainer: {
    padding: 16,
    borderRadius: BorderRadius.md,
  },
});
