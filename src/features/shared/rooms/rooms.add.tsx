import React, { useEffect, useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Pressable,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  VStack,
  FormControl,
  Image,
  Button,
  HStack,
  Box,
} from "@gluestack-ui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useTheme,
  ActivityIndicator,
  Divider,
  Surface,
  Portal,
  Modal,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import { Spacing, BorderRadius } from "@/constants";
import { pickImageExpo } from "@/infrastructure/image/image.service";
import { ROOM_FEATURE_TAGS } from "@/infrastructure/room/rooms.constants";
import {
  CreateRoomInput,
  CreateRoomInputSchema,
  roomFurnishingTypeOptions,
  roomTypeOptions,
} from "@/infrastructure/room/rooms.schema";
import { AppImageFile } from "@/infrastructure/image/image.schema";
import { expoStorageCleaner } from "@/infrastructure/utils/expo-utils/expo-utils.service";

import { FormField } from "../../../components/ui/FormFields/FormField";
import { TagListStateful } from "../../../components/ui/AmenitiesAndTagsLists/TagListStateful";
import PressableImagePicker from "../../../components/ui/ImageComponentUtilities/PressableImagePicker";
import { BottomSheetTriggerField } from "@/components/ui/BottomSheet/BottomSheetTriggerField";
import BottomSheetSelector from "@/components/ui/BottomSheet/BottomSheetSelector";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

import { useCreateMutation } from "@/infrastructure/room/rooms.redux.api";
import { useGetOwnerAccessQuery } from "@/infrastructure/access/access.redux.api";
import { RootState } from "@/application/store/stores";
import { isOwnerAccess } from "@/infrastructure/access/access.schema";

export default function RoomsAddScreen({ route }: any) {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { initialData, bhId } = route.params || {};

  // Clean storage on unmount
  // useEffect(() => {
  //   return () => {
  //     expoStorageCleaner(["images"]);
  //   };
  // }, []);

  /* ------------------------- Access & Lockdown ------------------------- */
  const ownerId = useSelector(
    (state: RootState) => state.owners.selectedUser?.id,
  );
  const { data: access, isLoading: isAccessLoading } = useGetOwnerAccessQuery(
    { id: ownerId! },
    { skip: !ownerId, refetchOnMountOrArgChange: true },
  );

  const lockdown = isOwnerAccess(access) ? !access.canManageRooms : false;

  /* --------------------------- Form Setup --------------------------- */
  const [createRoom, { isLoading: isSubmitting }] = useCreateMutation();
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateRoomInput>({
    resolver: zodResolver(CreateRoomInputSchema) as any,
    defaultValues: initialData || {
      roomNumber: "",
      description: "",
      roomType: "STUDIO",
      furnishingType: "FULLY_FURNISHED",
      maxCapacity: 0,
      price: 0,
      tags: [],
      gallery: [],
      thumbnail: [],
    },
  });

  const [isRoomTypeOpen, setIsRoomTypeOpen] = useState(false);
  const [isFurnishingOpen, setIsFurnishingOpen] = useState(false);

  /* ------------------------- Handlers -------------------------- */
  const thumbnailImage = watch("thumbnail")?.[0] as AppImageFile;

  const handlePickThumbnail = useCallback(
    (image: AppImageFile) => {
      setValue("thumbnail", [image], { shouldDirty: true });
    },
    [setValue],
  );

  const handlePickGallery = async () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    const pick = await pickImageExpo(10);
    if (pick?.length) setValue("gallery", pick);
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [tempData, setTempData] = useState<CreateRoomInput | null>(null);

  const onAttemptSubmit = (data: CreateRoomInput) => {
    ReactNativeHapticFeedback.trigger("impactMedium");
    setTempData(data);
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    if (!tempData) return;
    setShowConfirm(false); // Close modal first

    try {
      ReactNativeHapticFeedback.trigger("notificationSuccess");
      const payload = [{ ...tempData, boardingHouseId: +bhId }];
      await createRoom({ boardingHouseId: bhId, data: payload }).unwrap();
      Alert.alert("Success", "Room added to your inventory.");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        "Creation Failed",
        err?.data?.message || "Check your inputs.",
      );
    }
  };

  if (isAccessLoading || !access) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  /* ---------------------------- Overhauled UI ----------------------------- */
  return (
    <View style={s.root}>
      <StaticScreenWrapper
        style={{ backgroundColor: colors.background }}
        lockdown={lockdown}
      >
        <VStack space="xl" pb={80}>
          {/* Section 1: Media */}
          <VStack space="md">
            <Text style={s.sectionTitle}>Room Media</Text>
            <Surface elevation={0} style={s.containedSurface}>
              <PressableImagePicker
                image={thumbnailImage}
                pickImage={handlePickThumbnail}
                removeImage={() => setValue("thumbnail", [])}
              />
              <Text style={s.imageLabel}>Primary Thumbnail</Text>
            </Surface>
          </VStack>

          {/* Section 2: Details */}
          <VStack space="md">
            <Text style={s.sectionTitle}>Details & Pricing</Text>
            <VStack space="xs">
              <Text style={s.fieldLabel}>Room Name / Number</Text>
              <FormField
                name="roomNumber"
                control={control}
                isEditing
                inputConfig={{
                  placeholder: "e.g. 101",
                  inputContainerStyle: s.inputField,
                }}
              />
            </VStack>

            <HStack space="md">
              <VStack flex={1} space="xs">
                <Text style={s.fieldLabel}>Capacity</Text>
                <FormField
                  name="maxCapacity"
                  control={control}
                  isEditing
                  inputConfig={{
                    keyboardType: "numeric",
                    inputContainerStyle: s.inputField,
                  }}
                />
              </VStack>
              <VStack flex={1} space="xs">
                <Text style={s.fieldLabel}>Monthly Price</Text>
                <FormField
                  name="price"
                  control={control}
                  isEditing
                  inputConfig={{
                    keyboardType: "numeric",
                    inputContainerStyle: s.inputField,
                  }}
                />
              </VStack>
            </HStack>
          </VStack>

          <Divider style={s.divider} />

          {/* Section 3: Selection (Overhauled Trigger Fields) */}
          <VStack space="md">
            <Text style={s.sectionTitle}>Classification</Text>

            <VStack space="xs">
              <Text style={s.fieldLabel}>Room Category</Text>
              <Surface elevation={0} style={s.selectorSurface}>
                <BottomSheetTriggerField
                  name="roomType"
                  control={control}
                  label="" // Label handled by our custom text above
                  options={roomTypeOptions}
                  isEditing
                  onOpen={() => setIsRoomTypeOpen(true)}
                />
              </Surface>
            </VStack>

            <VStack space="xs">
              <Text style={s.fieldLabel}>Furnishing Status</Text>
              <Surface elevation={0} style={s.selectorSurface}>
                <BottomSheetTriggerField
                  name="furnishingType"
                  control={control}
                  label=""
                  options={roomFurnishingTypeOptions}
                  isEditing
                  onOpen={() => setIsFurnishingOpen(true)}
                />
              </Surface>
            </VStack>
          </VStack>

          <VStack space="xs">
            <Text style={s.fieldLabel}>Description</Text>
            <FormField
              name="description"
              control={control}
              isEditing
              inputConfig={{
                inputType: "paragraph",
                inputContainerStyle: s.textArea,
              }}
            />
          </VStack>

          {/* Amenities */}
          <VStack space="sm">
            <Text style={s.fieldLabel}>Amenities</Text>
            <TagListStateful
              name="tags"
              items={ROOM_FEATURE_TAGS}
              isEditing
              form={{ getValues, setValue, watch }}
            />
          </VStack>

          <Divider style={s.divider} />

          <VStack space="md">
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text style={s.sectionTitle}>Room Gallery</Text>
                <Text style={s.sectionSub}>
                  Add up to 10 photos of the interior.
                </Text>
              </VStack>
              <Button
                size="sm"
                variant="outline"
                onPress={handlePickGallery}
                action="primary"
                style={s.galleryBtn}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={16}
                  color={colors.primary}
                />
                <Text style={s.galleryBtnText}>Add</Text>
              </Button>
            </HStack>

            <Controller
              control={control}
              name="gallery"
              render={({ field: { value } }) => (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.galleryScroll}
                >
                  {value?.map((image, index) => (
                    <Box key={index} style={s.galleryItemWrapper}>
                      <Image
                        source={{
                          uri: image.uri.startsWith("file")
                            ? image.uri
                            : `file://${image.uri}`,
                        }}
                        style={s.galleryImage}
                        alt="Gallery"
                      />
                      <Pressable
                        onPress={() => {
                          const g = [...value];
                          g.splice(index, 1);
                          setValue("gallery", g);
                        }}
                        style={s.removeBtn}
                      >
                        <MaterialCommunityIcons
                          name="close-circle"
                          size={22}
                          color={colors.error}
                        />
                      </Pressable>
                    </Box>
                  ))}
                </ScrollView>
              )}
            />
          </VStack>
        </VStack>
      </StaticScreenWrapper>

      {/* Fixed Submission Footer */}
      {!lockdown && (
        <Box style={s.footer}>
          <Button
            size="lg"
            onPress={handleSubmit(onAttemptSubmit)} // Now calls attempt, not final
            isDisabled={isSubmitting}
            style={s.submitBtn}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={s.submitText}>Add Room</Text>
            )}
          </Button>
        </Box>
      )}

      {/* BOTTOM SHEET SELECTORS - Critical for the triggers above */}
      <BottomSheetSelector
        options={roomTypeOptions}
        isOpen={isRoomTypeOpen}
        onClose={() => setIsRoomTypeOpen(false)}
        onSelect={(value) => {
          setValue("roomType", value, { shouldDirty: true });
          setIsRoomTypeOpen(false);
        }}
      />

      <BottomSheetSelector
        options={roomFurnishingTypeOptions}
        isOpen={isFurnishingOpen}
        onClose={() => setIsFurnishingOpen(false)}
        onSelect={(value) => {
          setValue("furnishingType", value, { shouldDirty: true });
          setIsFurnishingOpen(false);
        }}
      />

      <Portal>
        <Modal
          visible={showConfirm}
          onDismiss={() => setShowConfirm(false)}
          contentContainerStyle={s.modalContainer}
        >
          <VStack space="md">
            <HStack alignItems="center" space="sm">
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={s.modalTitle}>Confirm Room Entry</Text>
            </HStack>

            <Text style={s.modalSub}>
              Are you sure you want to add{" "}
              <Text style={{ fontFamily: "Poppins-Bold" }}>
                Room {tempData?.roomNumber}
              </Text>{" "}
              to this property?
            </Text>

            <Surface elevation={0} style={s.confirmSummary}>
              <HStack justifyContent="space-between">
                <Text style={s.summaryLabel}>Price:</Text>
                <Text style={s.summaryValue}>
                  ₱{tempData?.price.toLocaleString()}
                </Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text style={s.summaryLabel}>Capacity:</Text>
                <Text style={s.summaryValue}>{tempData?.maxCapacity} Pax</Text>
              </HStack>
            </Surface>

            <HStack space="sm" mt={Spacing.sm}>
              <Button
                flex={1}
                variant="outline"
                onPress={() => setShowConfirm(false)}
                style={{ borderRadius: 8 }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins-Medium",
                    color: colors.outline,
                  }}
                >
                  Cancel
                </Text>
              </Button>
              <Button
                flex={2}
                onPress={handleFinalSubmit}
                style={{ backgroundColor: colors.primary, borderRadius: 8 }}
              >
                <Text
                  style={{ fontFamily: "Poppins-SemiBold", color: "white" }}
                >
                  Confirm & Add
                </Text>
              </Button>
            </HStack>
          </VStack>
        </Modal>
      </Portal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F9FC" },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#357FC1",
    marginBottom: 4,
  },
  sectionSub: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#767474",
    marginTop: -2,
  },
  fieldLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    color: "#1A1A1A",
    marginLeft: 2,
  },

  inputField: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    height: 48,
  },

  selectorSurface: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
    overflow: "hidden", // Ensures ripple stays inside
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    minHeight: 100,
  },

  containedSurface: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
    padding: 12,
  },

  imageLabel: {
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#767474",
    marginTop: 8,
  },
  divider: { marginVertical: 8, backgroundColor: "#E0E0E5", height: 1 },

  galleryBtn: { borderRadius: 8, borderColor: "#357FC1", height: 36 },
  galleryBtnText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    color: "#357FC1",
    marginLeft: 4,
  },
  galleryScroll: { gap: 12 },
  galleryItemWrapper: { position: "relative" },
  galleryImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  removeBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "white",
    borderRadius: 12,
  },

  footer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#E0E0E5",
  },
  submitBtn: {
    backgroundColor: "#357FC1",
    borderRadius: 12,
    height: 54,
  },
  submitText: { fontFamily: "Poppins-SemiBold", color: "white", fontSize: 15 },
  modalContainer: {
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
  modalSub: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  confirmSummary: {
    padding: 12,
    backgroundColor: "#F7F9FC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E5",
    marginTop: 4,
  },
  summaryLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#767474",
  },
  summaryValue: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    color: "#1A1A1A",
  },
});
