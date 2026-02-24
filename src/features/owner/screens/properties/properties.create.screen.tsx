import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Alert, Pressable, ScrollView } from "react-native";
import { Text, Button, useTheme, Divider, Chip } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "@gluestack-ui/themed";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { FormField } from "@/components/ui/FormFields/FormField";
import BottomSheetSelector from "@/components/ui/BottomSheet/BottomSheetSelector";
import PropertiesRoomCreate from "./components/properties.room.create";
import PressableImagePicker from "@/components/ui/ImageComponentUtilities/PressableImagePicker";

import { Spacing, BorderRadius, Fontsize } from "@/constants";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { useCreateMutation } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import {
  CreateBoardingHouseInput,
  CreateBoardingHouseInputSchema,
  CreateBoardingHouseSchema,
  occupancyTypeOptions,
  BackendOccupancyType,
} from "@/infrastructure/boarding-houses/boarding-house.schema";
import { AMENITIES } from "@/infrastructure/boarding-houses/boarding-house.constants";
import { pickImageExpo } from "@/infrastructure/image/image.service";
import { expoStorageCleaner } from "@/infrastructure/utils/expo-utils/expo-utils.service";
import { usePropertyNavigation } from "./navigation/properties.navigation.hooks";
import { AppImageFile } from "@/infrastructure/image/image.schema";

export default function PropertiesCreateScreen() {
  const theme = useTheme();
  const propertyNavigation = usePropertyNavigation();
  const { selectedUser } = useDynamicUserApi();
  const [createBh, { isLoading }] = useCreateMutation();
  const [isOccupancyOpen, setIsOccupancyOpen] = useState(false);

  useEffect(() => {
    return () => expoStorageCleaner(["images", "documents"]);
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<CreateBoardingHouseInput>({
    resolver: zodResolver(CreateBoardingHouseInputSchema) as any,
    defaultValues: {
      ownerId: selectedUser?.id ?? 0,
      occupancyType: "MIXED",
      availabilityStatus: false,
      amenities: [],
      thumbnail: [],
      gallery: [],
      location: { type: "Point", coordinates: [1, 1] },
      rooms: [],
    },
  });

  const selectedAmenities = watch("amenities") || [];
  const thumbnailImage = watch("thumbnail")?.[0] as AppImageFile;

  /* ------------------------- Image Logic ------------------------- */
  const handlePickThumbnail = useCallback(
    (image: AppImageFile) => {
      setValue("thumbnail", [image], {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const handlePickGalleryImages = async () => {
    const pick = await pickImageExpo(10);
    if (pick?.length) setValue("gallery", pick);
  };

  const handleRemoveGalleryImage = (index: number) => {
    const gallery = [...(getValues("gallery") ?? [])];
    gallery.splice(index, 1);
    setValue("gallery", gallery);
  };

  const toggleAmenity = (amenity: string) => {
    const current = [...selectedAmenities];
    const index = current.indexOf(amenity as any);
    if (index > -1) current.splice(index, 1);
    else current.push(amenity as any);
    setValue("amenities", current);
  };

  const onSubmit = async (data: CreateBoardingHouseInput) => {
    console.log("hit");
    if (data.location.coordinates[0] === 1) {
      return Alert.alert(
        "Location Required",
        "Please pin your property on the map.",
      );
    }
    try {
      const transformed = CreateBoardingHouseSchema.parse({
        ...data,
        rooms:
          data.rooms?.map((r) => ({
            ...r,
            maxCapacity: Number(r.maxCapacity),
            price: Number(r.price),
          })) || [],
      });
      await createBh(transformed).unwrap();
      propertyNavigation.navigate("PropertiesHome");
    } catch (e: any) {
      Alert.alert("Error", e?.data?.message || "Check all required fields.");
    }
  };

  return (
    <StaticScreenWrapper variant="form" loading={isLoading}>
      <View style={s.root}>
        {/* 1. HERO THUMBNAIL (Using your stable Picker) */}
        <PressableImagePicker
          image={thumbnailImage}
          pickImage={handlePickThumbnail}
          removeImage={() => setValue("thumbnail", [])}
        />

        {/* 2. TITLE SECTION */}
        <View style={s.headerMeta}>
          <View style={{ flex: 1 }}>
            <FormField
              name="name"
              control={control}
              isEditing={true}
              placeholder="Property Name"
              textStyle={s.titleText}
              inputStyle={s.titleText}
            />
          </View>
        </View>

        <Divider />

        {/* 3. CORE DETAILS */}
        <View style={s.section}>
          <FormField
            name="address"
            control={control}
            isEditing
            label="Street Address"
            prefix="📍 "
          />
          <FormField
            name="description"
            control={control}
            isEditing
            inputType="paragraph"
            label="About Property"
          />

          <View style={s.rowGap}>
            <Button
              mode="outlined"
              icon="account-multiple"
              style={s.selector}
              onPress={() => setIsOccupancyOpen(true)}
            >
              Tenant: {watch("occupancyType")}
            </Button>
            <Button
              mode="outlined"
              icon="map-search"
              style={s.selector}
              onPress={() =>
                propertyNavigation.navigate("PropertyLocationPicker", {
                  onSelect: (c) =>
                    setValue("location.coordinates", [c.longitude, c.latitude]),
                })
              }
            >
              Update Map Pin
            </Button>
          </View>
        </View>

        {/* 4. GALLERY SECTION */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text variant="titleMedium" style={s.sectionTitle}>
              Gallery
            </Text>
            <Pressable onPress={handlePickGalleryImages}>
              <Text style={{ color: theme.colors.primary, fontWeight: "bold" }}>
                Add Images
              </Text>
            </Pressable>
          </View>

          <Controller
            control={control}
            name="gallery"
            render={({ field: { value } }) => (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {value?.map((image, index) => (
                  <View key={index} style={s.galleryItem}>
                    <Image
                      source={{ uri: image.uri }}
                      style={s.galleryImage}
                      alt="Gallery"
                    />
                    <Pressable
                      onPress={() => handleRemoveGalleryImage(index)}
                      style={s.galleryRemove}
                    >
                      <Ionicons name="close-circle" size={22} color="white" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}
          />
        </View>

        {/* 5. AMENITIES */}
        <View style={s.section}>
          <Text variant="titleMedium" style={s.sectionTitle}>
            Amenities
          </Text>
          <View style={s.chipGroup}>
            {AMENITIES.map((item) => (
              <Chip
                key={item}
                selected={selectedAmenities.includes(item as any)}
                onPress={() => toggleAmenity(item)}
                style={s.chip}
                showSelectedCheck
                mode="outlined"
              >
                {item}
              </Chip>
            ))}
          </View>
        </View>

        <Divider />

        {/* 6. ROOMS SUB-FORM */}
        <PropertiesRoomCreate
          rooms={watch("rooms") || []}
          setRooms={(val) => setValue("rooms", val, { shouldValidate: true })}
        />

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit, (err) => {
            console.log("❌ Validation Failed:", JSON.stringify(err, null, 2));
            Alert.alert(
              "Form Error",
              "Please check all fields and ensure at least one image is selected.",
            );
          })}
          style={s.submitBtn}
          loading={isLoading}
        >
          Publish Boarding House
        </Button>
      </View>

      <BottomSheetSelector<BackendOccupancyType>
        options={occupancyTypeOptions}
        isOpen={isOccupancyOpen}
        onClose={() => setIsOccupancyOpen(false)}
        onSelect={(v) => {
          setValue("occupancyType", v);
          setIsOccupancyOpen(false);
        }}
      />
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  root: { gap: Spacing.lg },
  headerMeta: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  titleText: { fontSize: Fontsize.h1, fontWeight: "900" },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: -4,
  },
  section: { gap: Spacing.md },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontWeight: "bold" },
  rowGap: { gap: Spacing.sm },
  selector: { borderRadius: BorderRadius.md, justifyContent: "flex-start" },
  chipGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: BorderRadius.pill },
  galleryItem: { marginRight: 12, position: "relative" },
  galleryImage: { width: 120, height: 120, borderRadius: BorderRadius.md },
  galleryRemove: { position: "absolute", top: 4, right: 4 },
  submitBtn: { marginTop: Spacing.xl, borderRadius: BorderRadius.pill },
  submitContent: { paddingVertical: 10 },
});
