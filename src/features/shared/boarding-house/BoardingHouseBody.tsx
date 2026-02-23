import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { VStack } from "@gluestack-ui/themed";
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
import { Surface } from "react-native-paper";

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
  return (
    <VStack style={s.body}>
      <ImageCarousel variant="secondary" images={data.gallery ?? []} />

      {/* Description */}
      <Surface elevation={0}>
        <Text style={s.sectionTitle}>Description: </Text>
        <FormField name="description" control={control} isEditing={isEditing} />
      </Surface>

      {/* Amenities */}
      <VStack style={s.amenitiesContainer}>
        <Text style={s.sectionTitle}>Amenities: </Text>
        <TagListStateful
          name="amenities"
          items={AMENITIES}
          isEditing={isEditing}
          form={{
            getValues: form.getValues,
            setValue: form.setValue,
            watch: form.watch,
          }}
        />
      </VStack>
    </VStack>
  );
}

const s = StyleSheet.create({
  body: { gap: Spacing.xl },
  sectionTitle: {
    fontSize: Fontsize.lg,
    fontWeight: "600",
  },
  amenitiesContainer: {
    padding: 16,
    borderRadius: BorderRadius.md,
  },
  inputContainerStyle: {
    borderWidth: 3,
    borderColor: "green",
    borderRadius: BorderRadius.md,
  },
});

interface BoardingHouseBodyViewInteface {
  mode: "view";
  data: FindOneBoardingHouse;
  onViewRooms: () => void;
}

export function BoardingHouseBodyView({ data }: BoardingHouseBodyViewInteface) {
  const amenities = data.amenities ?? [];

  return (
    <VStack style={s.body}>
      <ImageCarousel variant="secondary" images={data.gallery ?? []} />

      {/* Description */}
      <Text style={sView.sectionTitle}>Description:</Text>
      <Text style={sView.descriptionText}>
        {data.description?.trim() || "No description provided."}
      </Text>

      {/* Amenities */}
      <VStack style={sView.amenitiesContainer}>
        <Text style={sView.sectionTitle}>Amenities:</Text>
        <TagListDumb
          items={amenities}
          selected={amenities}
          isEditing={false}
          onToggle={() => {}}
        />
      </VStack>
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
