import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { HStack, VStack } from "@gluestack-ui/themed";
import ImageCarousel from "@/components/ui/ImageCarousel";
import { FormField } from "@/components/ui/FormFields/FormField";
import { TagListStateful } from "@/components/ui/AmenitiesAndTagsLists/TagListStateful";
import { AMENITIES } from "@/infrastructure/boarding-houses/boarding-house.constants";
import { BorderRadius, Fontsize, Spacing } from "@/constants";
import {
  FindOneBoardingHouse,
  OccupancyType,
  PatchBoardingHouseInput,
} from "@/infrastructure/boarding-houses/boarding-house.schema";
import {
  FieldErrors,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import TagListDumb from "@/components/ui/AmenitiesAndTagsLists/TagListDumb";
import { Surface, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ControlledMultilineField from "@/components/ui/FormFields/ControlledMultilineField";

interface BoardingHouseBodyInterface {
  data: FindOneBoardingHouse;
  control: any;
  isEditing: boolean;
  onViewRooms: () => void;
  isOccupancySheetOpen: boolean;
  onOpenOccupancySheet: () => void;
  onCloseOccupancySheet: () => void;
  onSelectOccupancy: (value: OccupancyType) => void;
  errors: FieldErrors<PatchBoardingHouseInput>;
  form: {
    getValues: UseFormGetValues<PatchBoardingHouseInput>;
    setValue: UseFormSetValue<PatchBoardingHouseInput>;
    watch: UseFormWatch<PatchBoardingHouseInput>;
  };
}

export function BoardingHouseBodyEdit({
  data,
  control,
  isEditing,
  errors,
  form,
  onViewRooms,
  isOccupancySheetOpen,
  onOpenOccupancySheet,
  onCloseOccupancySheet,
  onSelectOccupancy,
}: BoardingHouseBodyInterface) {
  const { colors } = useTheme();

  return (
    <VStack style={s.body}>
      <ImageCarousel images={data.gallery ?? []} />

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
          placeholder="Describe your boarding house..."
        />
      </Surface>

      <Surface style={s.cardImportant} elevation={0}>
        <HStack style={s.cardHeader}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={20}
            color="#8A6700"
          />
          <Text style={s.sectionTitle}>House Rules & Terms</Text>
        </HStack>

        <Text style={s.rulesNotice}>
          These rules are shown to tenants before booking and may appear in the
          booking agreement.
        </Text>

        <ControlledMultilineField
          name="houseRulesContent"
          control={control}
          isEditing={isEditing}
          label="Rules shown to tenants"
          important
          maxLength={2000}
          helperText="Be clear and specific. Tenants will rely on this before confirming a booking."
          placeholder={
            "Example:\n" +
            "• Curfew is 10:00 PM unless approved by the owner.\n" +
            "• Visitors are not allowed inside private rooms.\n" +
            "• Keep shared spaces clean.\n" +
            "• Advance payment is non-refundable once confirmed."
          }
        />
      </Surface>

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
          name="amenities"
          items={AMENITIES}
          isEditing={isEditing}
          form={form}
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

  cardImportant: {
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: "#E7C85A",
    backgroundColor: "#FFFDF7",
  },

  rulesNotice: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Poppins-Regular",
    color: "#7A6A2A",
    marginBottom: Spacing.sm,
  },

  rulesText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    lineHeight: 22,
    color: "#3A3A3A",
  },
});

interface BoardingHouseBodyViewInteface {
  mode: "view";
  data: FindOneBoardingHouse;
  onViewRooms: () => void;
}

export function BoardingHouseBodyView({ data }: BoardingHouseBodyViewInteface) {
  const { colors } = useTheme();
  const amenities = data.amenities ?? [];

  return (
    <VStack style={s.body}>
      <ImageCarousel images={data.gallery ?? []} />

      {/* Description Card */}
      <Surface style={s.card} elevation={0}>
        <Text style={s.label}>ABOUT THIS PROPERTY</Text>
        <Text style={s.descriptionText}>
          {data.description?.trim() ||
            "The owner hasn't provided a description yet."}
        </Text>
      </Surface>

      <Surface style={s.cardImportant} elevation={0}>
        <HStack style={s.cardHeader}>
          <MaterialCommunityIcons
            name="shield-alert-outline"
            size={20}
            color="#8A6700"
          />
          <Text style={s.sectionTitle}>House Rules & Terms</Text>
        </HStack>

        <Text style={s.rulesNotice}>
          Please review these rules before proceeding with a booking.
        </Text>

        <Text style={s.rulesText}>
          {data.houseRulesContent?.trim() ||
            "The owner has not provided house rules yet."}
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

  cardImportant: {
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: "#E7C85A",
    backgroundColor: "#FFFDF7",
  },

  rulesNotice: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Poppins-Regular",
    color: "#7A6A2A",
    marginBottom: Spacing.sm,
  },

  rulesText: {
    fontSize: Fontsize.md,
    fontFamily: "Poppins-Regular",
    lineHeight: 22,
    color: "#3A3A3A",
  },
});
