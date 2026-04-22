import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Alert, Pressable, ScrollView } from "react-native";
import {
  Text,
  Button,
  useTheme,
  Divider,
  Chip,
  ActivityIndicator,
  Surface,
  Portal,
  Modal,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, VStack, HStack, Box } from "@gluestack-ui/themed";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { FormField } from "@/components/ui/FormFields/FormField";
import BottomSheetSelector from "@/components/ui/BottomSheet/BottomSheetSelector";
import PropertiesRoomCreate from "./components/properties.room.create";
import PressableImagePicker from "@/components/ui/ImageComponentUtilities/PressableImagePicker";
import { Spacing, BorderRadius } from "@/constants";
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
import { isOwnerAccess } from "@/infrastructure/access/access.schema";
import { useGetOwnerAccessQuery } from "@/infrastructure/access/access.redux.api";
import { useSelector } from "react-redux";
import { RootState } from "@/application/store/stores";
import { BottomSheetTriggerField } from "@/components/ui/BottomSheet/BottomSheetTriggerField";
import ControlledMultilineField from "@/components/ui/FormFields/ControlledMultilineField";

export default function PropertiesCreateScreen() {
  const { colors } = useTheme();
  const propertyNavigation = usePropertyNavigation();
  const { selectedUser } = useDynamicUserApi();
  const [createBh, { isLoading: isPublishing }] = useCreateMutation();

  const [isOccupancyOpen, setIsOccupancyOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tempData, setTempData] = useState<CreateBoardingHouseInput | null>(
    null,
  );

  const userId = useSelector(
    (state: RootState) => state.owners.selectedUser?.id,
  );
  const { data: access, isLoading: isAccessLoading } = useGetOwnerAccessQuery(
    { id: userId! },
    { skip: !userId, refetchOnMountOrArgChange: true },
  );

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
      houseRulesContent: "",
    },
  });

  const selectedAmenities = watch("amenities") || [];
  const thumbnailImage = watch("thumbnail")?.[0];
  const houseRulesContent = watch("houseRulesContent") || "";

  /* ------------------------- Handlers ------------------------- */
  const handlePickThumbnail = useCallback(
    (image: any) => {
      setValue("thumbnail", [image], { shouldDirty: true });
    },
    [setValue],
  );

  const handlePickGallery = async () => {
    ReactNativeHapticFeedback.trigger("impactLight");
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

  const onAttemptSubmit = (data: CreateBoardingHouseInput) => {
    if (data.location.coordinates[0] === 1) {
      return Alert.alert(
        "Map Pin Missing",
        "Please locate your property on the map.",
      );
    }
    setTempData(data);
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    if (!tempData) return;
    setShowConfirm(false);
    try {
      const transformed = CreateBoardingHouseSchema.parse({
        ...tempData,
        rooms:
          tempData.rooms?.map((r) => ({
            ...r,
            maxCapacity: Number(r.maxCapacity),
            price: Number(r.price),
          })) || [],
      });
      await createBh(transformed).unwrap();
      propertyNavigation.navigate("PropertiesHome");
    } catch (e: any) {
      Alert.alert("Error", e?.data?.message || "Validation failed.");
    }
  };

  if (isAccessLoading || !access)
    return <ActivityIndicator style={{ flex: 1 }} />;
  const lockdown = isOwnerAccess(access)
    ? !access.canCreateBoardingHouse
    : false;

  return (
    <View style={s.root}>
      {/* 1. CONFIRMATION DIALOG */}
      <Portal>
        <Modal
          visible={showConfirm}
          onDismiss={() => setShowConfirm(false)}
          contentContainerStyle={s.modal}
        >
          <VStack space="md">
            <Text style={s.modalTitle}>Publish Property?</Text>
            <Text style={s.modalSub}>
              This will make "{tempData?.name}" visible to all tenants in Ormoc
              City.
            </Text>
            <HStack space="sm" mt={10}>
              <Button
                flex={1}
                mode="outlined"
                onPress={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button flex={2} mode="contained" onPress={handleFinalSubmit}>
                Confirm Publish
              </Button>
            </HStack>
          </VStack>
        </Modal>
      </Portal>

      <StaticScreenWrapper
        variant="list"
        loading={isPublishing}
        lockdown={lockdown}
      >
        <VStack space="xl" pb={100}>
          {/* Header & Main Visual */}
          <VStack space="md">
            <Text style={s.sectionHeader}>Property Visuals</Text>
            <Surface elevation={0} style={s.containedSurface}>
              <PressableImagePicker
                image={thumbnailImage}
                pickImage={handlePickThumbnail}
                removeImage={() => setValue("thumbnail", [])}
              />
              <Text style={s.imageHint}>Main Search Thumbnail</Text>
            </Surface>
          </VStack>

          {/* Core Info */}
          <VStack space="md">
            <Text style={s.sectionHeader}>Basic Information</Text>
            <Surface elevation={0} style={s.containedSurface}>
              <VStack space="lg">
                <VStack flex={1} space="xs">
                  <Text style={s.fieldLabel}>Boarding House Name</Text>
                  <FormField
                    name="name"
                    control={control}
                    isEditing
                    labelConfig={{
                      labelStyle: s.label,
                    }}
                    inputConfig={{ inputContainerStyle: s.input }}
                  />
                </VStack>
                <VStack flex={1} space="xs">
                  <Text style={s.fieldLabel}>Street Address</Text>
                  <FormField
                    name="address"
                    control={control}
                    isEditing
                    labelConfig={{
                      labelStyle: s.label,
                    }}
                    inputConfig={{ inputContainerStyle: s.input }}
                  />
                </VStack>
                <VStack flex={1} space="xs">
                  <Text style={s.fieldLabel}>Boarding House Description</Text>
                  <FormField
                    name="description"
                    control={control}
                    isEditing
                    inputType="paragraph"
                    labelConfig={{
                      labelStyle: s.label,
                    }}
                    inputConfig={{ inputContainerStyle: s.textArea }}
                  />
                </VStack>
              </VStack>
            </Surface>
          </VStack>

          {/* Classification & Mapping */}
          <VStack space="md">
            <Text style={s.sectionHeader}>Logistics</Text>
            <HStack space="md">
              <VStack flex={1} space="xs">
                <Text style={s.label}>Tenant Policy</Text>
                <Surface elevation={0} style={s.selectorSurface}>
                  <BottomSheetTriggerField
                    name="occupancyType"
                    control={control}
                    options={occupancyTypeOptions}
                    isEditing
                    onOpen={() => setIsOccupancyOpen(true)}
                  />
                </Surface>
              </VStack>
              <VStack flex={1} space="xs">
                <Text style={s.label}>Map Location</Text>
                <Button
                  mode="outlined"
                  icon="map-marker-radius"
                  style={s.mapBtn}
                  contentStyle={{ height: 48 }}
                  onPress={() =>
                    propertyNavigation.navigate("PropertyLocationPicker", {
                      onSelect: (c) =>
                        setValue("location.coordinates", [
                          c.longitude,
                          c.latitude,
                        ]),
                    })
                  }
                >
                  {watch("location.coordinates")[0] === 1
                    ? "Pin on Map"
                    : `Location ${getValues("location").coordinates[1].toFixed(2)} ${getValues("location").coordinates[0].toFixed(2)}`}
                </Button>
              </VStack>
            </HStack>
            <VStack space="md">
              <Text style={s.sectionHeader}>House Rules & Terms</Text>

              <Surface elevation={0} style={s.priorityNotice}>
                <HStack space="sm" alignItems="flex-start">
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={20}
                    color="#8A6700"
                    style={{ marginTop: 1 }}
                  />
                  <VStack flex={1} space="xs">
                    <Text style={s.priorityTitle}>
                      High Priority Listing Requirement
                    </Text>
                    <Text style={s.priorityText}>
                      These rules will be shown to tenants before they proceed
                      with booking and may be included in the generated booking
                      agreement after payment.
                    </Text>
                  </VStack>
                </HStack>
              </Surface>

              <Surface elevation={0} style={s.containedSurfaceImportant}>
                <VStack space="md">
                  <VStack flex={1} space="xs">
                    <HStack
                      justifyContent="space-between"
                      alignItems="center"
                    ></HStack>
                    <ControlledMultilineField
                      name="houseRulesContent"
                      control={control}
                      label="Booking Rules Shown to Tenants"
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
                  </VStack>
                </VStack>
              </Surface>
            </VStack>
          </VStack>

          {/* Gallery Scroll */}
          <VStack space="md">
            <HStack justifyContent="space-between" alignItems="center">
              <Text style={s.sectionHeader}>Interior Gallery</Text>
              <Pressable onPress={handlePickGallery}>
                <Text style={s.link}>Add Photos</Text>
              </Pressable>
            </HStack>
            <Controller
              control={control}
              name="gallery"
              render={({ field: { value } }) => (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12 }}
                >
                  {value?.map((image, index) => (
                    <Box key={index} style={s.galleryBox}>
                      <Image
                        source={{ uri: image.uri }}
                        style={s.galleryImg}
                        alt="Gallery"
                      />
                      <Pressable
                        onPress={() => handleRemoveGalleryImage(index)}
                        style={s.removeIcon}
                      >
                        <MaterialCommunityIcons
                          name="close-circle"
                          size={22}
                          color={colors.error}
                        />
                      </Pressable>
                    </Box>
                  ))}
                  {(!value || value.length === 0) && (
                    <Text style={s.emptyHint}>
                      No gallery images added yet.
                    </Text>
                  )}
                </ScrollView>
              )}
            />
          </VStack>

          {/* Amenities Grid */}
          <VStack space="md">
            <Text style={s.sectionHeader}>Amenities & Facilities</Text>
            <View style={s.chipContainer}>
              {AMENITIES.map((item) => (
                <Chip
                  key={item}
                  selected={selectedAmenities.includes(item as any)}
                  onPress={() => toggleAmenity(item)}
                  style={[
                    s.chip,
                    selectedAmenities.includes(item as any) && {
                      borderColor: colors.primary,
                    },
                  ]}
                  textStyle={s.chipText}
                  showSelectedCheck
                  mode="outlined"
                >
                  {item}
                </Chip>
              ))}
            </View>
          </VStack>

          <Divider style={{ backgroundColor: "#E0E0E5" }} />

          {/* Room Management Section */}
          <PropertiesRoomCreate
            rooms={watch("rooms") || []}
            setRooms={(val) => setValue("rooms", val, { shouldValidate: true })}
          />
        </VStack>
      </StaticScreenWrapper>

      {/* Footer CTA */}
      {!lockdown && (
        <Box style={s.footer}>
          <Button
            mode="contained"
            onPress={handleSubmit(onAttemptSubmit)}
            style={s.publishBtn}
            loading={isPublishing}
            contentStyle={{ height: 54 }}
          >
            <Text style={s.publishBtnText}>Publish Boarding House</Text>
          </Button>
        </Box>
      )}

      <BottomSheetSelector<BackendOccupancyType>
        title="Select Occupancy"
        options={occupancyTypeOptions}
        isOpen={isOccupancyOpen}
        onClose={() => setIsOccupancyOpen(false)}
        onSelect={(v) => {
          setValue("occupancyType", v);
          setIsOccupancyOpen(false);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F9FC" },
  sectionHeader: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#357FC1",
  },
  label: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  fieldLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    color: "#1A1A1A",
    marginLeft: 2,
  },

  containedSurface: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
  },

  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    height: 48,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    minHeight: 100,
  },

  selectorSurface: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  mapBtn: {
    borderRadius: 8,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
  },

  imageHint: {
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#767474",
    marginTop: 8,
  },
  link: { fontFamily: "Poppins-Bold", color: "#357FC1", fontSize: 13 },

  galleryBox: { position: "relative" },
  galleryImg: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E5",
  },
  removeIcon: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "white",
    borderRadius: 12,
  },
  emptyHint: {
    fontFamily: "Poppins-Italic",
    fontSize: 12,
    color: "#9A9A9A",
    padding: 20,
  },

  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 8, backgroundColor: "white" },
  chipText: { fontFamily: "Poppins-Medium", fontSize: 12 },

  footer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#E0E0E5",
  },
  publishBtn: { borderRadius: 12, backgroundColor: "#357FC1" },
  publishBtnText: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },

  modal: {
    backgroundColor: "white",
    margin: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  modalTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#1A1A1A",
  },
  modalSub: { fontFamily: "Poppins-Regular", fontSize: 14, color: "#666" },
  priorityNotice: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E7C85A",
    backgroundColor: "#FFF8DB",
  },

  priorityTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    color: "#6B5200",
  },

  priorityText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    lineHeight: 18,
    color: "#7A6A2A",
  },

  containedSurfaceImportant: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E7C85A",
    backgroundColor: "#FFFFFF",
  },

  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FFF3C4",
    borderWidth: 1,
    borderColor: "#E7C85A",
  },

  priorityBadgeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 11,
    color: "#7A5A00",
  },

  rulesTextAreaImportant: {
    borderWidth: 1.5,
    borderColor: "#E7C85A",
    borderRadius: 8,
    minHeight: 140,
    backgroundColor: "#FFFDF7",
  },

  rulesHintStrong: {
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    lineHeight: 18,
    color: "#7A6A2A",
  },

  rulesMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  rulesCount: {
    fontFamily: "Poppins-Medium",
    fontSize: 11,
    color: "#9A9A9A",
  },
});
