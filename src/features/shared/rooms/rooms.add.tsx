import React, { useEffect } from "react";
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
import { VStack, FormControl, Image, Button } from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";
import { BorderRadius, Colors, Fontsize, Spacing } from "@/constants";
import { pickImageExpo } from "@/infrastructure/image/image.service";
import { ROOM_FEATURE_TAGS } from "@/infrastructure/room/rooms.constants";
import {
  CreateRoomInput,
  CreateRoomInputSchema,
  RoomFurnishingType,
  roomFurnishingTypeOptions,
  RoomType,
  roomTypeOptions,
} from "@/infrastructure/room/rooms.schema";
import { z } from "zod";

import { FormField } from "../../../components/ui/FormFields/FormField";
import { TagListStateful } from "../../../components/ui/AmenitiesAndTagsLists/TagListStateful";
import PressableImagePicker from "../../../components/ui/ImageComponentUtilities/PressableImagePicker";
import { AppImageFile } from "@/infrastructure/image/image.schema";
import { BottomSheetTriggerField } from "@/components/ui/BottomSheet/BottomSheetTriggerField";
import BottomSheetSelector from "@/components/ui/BottomSheet/BottomSheetSelector";
import { useCreateMutation } from "@/infrastructure/room/rooms.redux.api";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OwnerDashboardStackParamList } from "@/features/owner/screens/dashboard/navigation/dashboard.types";
import { expoStorageCleaner } from "@/infrastructure/utils/expo-utils/expo-utils.service";

export default function RoomsAddScreen({ route }: any) {
  React.useEffect(() => {
    return () => {
      expoStorageCleaner(["images"]);
    };
  }, []);
  const { initialData, bhId } = route.params || {};
  const navigate =
    useNavigation<NativeStackNavigationProp<OwnerDashboardStackParamList>>();

  const [createRoom, { isError, isLoading }] = useCreateMutation();

  /* ------------------------- Default values ------------------------- */
  const defaultValues: CreateRoomInput = {
    roomNumber: "",
    description: "",
    roomType: "STUDIO",
    furnishingType: "FULLY_FURNISHED",
    maxCapacity: 0,
    price: 0,
    tags: [],
    gallery: [],
    thumbnail: [],
  };

  /* --------------------------- Form setup --------------------------- */
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof CreateRoomInputSchema>>({
    resolver: zodResolver(CreateRoomInputSchema) as any,
    defaultValues: initialData || defaultValues,
  });

  useEffect(() => {
    reset(initialData || defaultValues);
  }, [initialData]);

  const [isActionSheetRoomTypeOpen, setIsActionSheetRoomTypeOpen] =
    React.useState(false);
  const [isActionSheetFurnishingOpen, setIsActionSheetFurnishingOpen] =
    React.useState(false);

  /* ------------------------- Image handlers -------------------------- */
  const thumbnailImage = watch("thumbnail")?.[0] as AppImageFile;
  const handlePickThumbnailImage = React.useCallback(
    (image: AppImageFile) => {
      setValue("thumbnail", [image], {
        shouldDirty: true,
        shouldValidate: false,
      });
    },
    [setValue],
  );

  const handlePickGalleryImages = async () => {
    const pick = await pickImageExpo(10);
    if (pick?.length) setValue("gallery", pick);
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const gallery = [...(getValues("gallery") ?? [])];
    gallery.splice(indexToRemove, 1);
    setValue("gallery", gallery);
  };

  /* --------------------------- Submit --------------------------- */
  const handleFinalSubmit = async (data: CreateRoomInput) => {
    console.log("Room Data Submitted:", data);

    try {
      const payload = [{ ...data, boardingHouseId: +bhId }];

      await createRoom({
        boardingHouseId: bhId,
        data: payload,
      });

      await expoStorageCleaner(["images", "documents"]);
      Alert.alert("Success", "Room Added");
      navigate.goBack();
    } catch (err: any) {
      console.error("PATCH failed:", err);
      let message = "Unknown error";
      if (err?.data) {
        message = JSON.stringify(err.data, null, 2);
      } else if (err?.error) {
        message = err.error;
      }
      Alert.alert("Failed to Add Room", message);
    }
  };

  /* ---------------------------- UI ----------------------------- */
  return (
    <View style={styles.screenContainer}>
      <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
        {/* Thumbnail */}
        <PressableImagePicker
          image={thumbnailImage}
          pickImage={handlePickThumbnailImage}
          removeImage={() => setValue("thumbnail", [])}
        />

        <VStack style={{ gap: Spacing.md }}>
          <FormField
            name="roomNumber"
            control={control}
            isEditing
            inputConfig={{ inputContainerStyle: styles.input }}
            labelConfig={{ label: "Room Code", labelStyle: styles.label }}
          />

          <FormControl isInvalid={!!errors.maxCapacity}>
            <FormField
              name="maxCapacity"
              control={control}
              isEditing
              inputConfig={{
                inputContainerStyle: styles.input,
                keyboardType: "numeric",
              }}
              labelConfig={{
                label: "Room Max Capacity",
                labelStyle: styles.label,
              }}
            />
          </FormControl>

          <FormControl isInvalid={!!errors.price}>
            <FormField
              name="price"
              control={control}
              isEditing
              inputConfig={{
                inputContainerStyle: styles.input,
                keyboardType: "numeric",
              }}
              labelConfig={{
                label: "Room Price",
                labelStyle: styles.label,
              }}
            />
          </FormControl>

          {/* Room Type */}
          <BottomSheetTriggerField
            name="roomType"
            control={control}
            label="Room Type"
            options={roomTypeOptions}
            isEditing
            error={errors.roomType?.message}
            onOpen={() => setIsActionSheetRoomTypeOpen(true)}
          />

          {/* Furnishing */}
          <BottomSheetTriggerField
            name="furnishingType"
            control={control}
            label="Furnishing Type"
            options={roomFurnishingTypeOptions}
            isEditing
            placeholder="Select Furnishing Type"
            error={errors.furnishingType?.message}
            onOpen={() => setIsActionSheetFurnishingOpen(true)}
          />

          <FormControl isInvalid={!!errors.description}>
            <FormField
              name="description"
              control={control}
              isEditing
              inputConfig={{
                inputContainerStyle: styles.input,
                inputType: "paragraph",
              }}
              labelConfig={{
                label: "Description: ",
                labelStyle: styles.label,
              }}
            />
          </FormControl>

          <TagListStateful
            name="tags"
            items={ROOM_FEATURE_TAGS}
            isEditing
            form={{ getValues, setValue, watch }}
          />
        </VStack>

        {/* Gallery */}
        <VStack>
          <Pressable
            onPress={handlePickGalleryImages}
            style={styles.pickButton}
          >
            <Text style={styles.pickText}>Select Images</Text>
          </Pressable>

          <Controller
            control={control}
            name="gallery"
            render={({ field: { value } }) => (
              <ScrollView horizontal style={{ marginTop: 10 }}>
                {value?.length ? (
                  value.map((image, index) => (
                    <View key={index}>
                      <Image
                        source={{
                          uri: image.uri.startsWith("file://")
                            ? image.uri
                            : `file://${image.uri}`,
                        }}
                        style={styles.galleryImage}
                        alt={`Gallery ${index}`}
                      />
                      <Pressable
                        onPress={() => handleRemoveGalleryImage(index)}
                        style={styles.removeIcon}
                      >
                        <Ionicons name="close-circle" size={20} color="white" />
                      </Pressable>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: "white" }}>No Images Selected</Text>
                )}
              </ScrollView>
            )}
          />
        </VStack>
      </ScrollView>

      <Button
        onPress={handleSubmit(handleFinalSubmit, (errors) => {
          console.log("❌ SUBMIT BLOCKED BY VALIDATION");
          console.log(errors);
        })}
      >
        <Text>Add Room</Text>
      </Button>

      <BottomSheetSelector
        options={roomTypeOptions}
        isOpen={isActionSheetRoomTypeOpen}
        onClose={() => setIsActionSheetRoomTypeOpen(false)}
        onSelect={(value) => {
          setValue("roomType", value, { shouldDirty: true });
          setIsActionSheetRoomTypeOpen(false);
        }}
      />

      <BottomSheetSelector
        options={roomFurnishingTypeOptions}
        isOpen={isActionSheetFurnishingOpen}
        onClose={() => setIsActionSheetFurnishingOpen(false)}
        onSelect={(value) => {
          setValue("furnishingType", value, { shouldDirty: true });
          setIsActionSheetFurnishingOpen(false);
        }}
      />
    </View>
  );
}

/* ---------------------------- Styles ---------------------------- */

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    // backgroundColor: Colors.
    padding: Spacing.md,
  },
  label: {
    color: Colors.TextInverse[2],
    fontWeight: "bold",
    fontSize: Fontsize.xl,
  },
  input: {
    // borderColor: Colors.
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  pickButton: {
    padding: Spacing.sm,
    alignSelf: "flex-start",
    // backgroundColor: Colors.
    borderRadius: BorderRadius.md,
  },
  pickText: {
    color: Colors.TextInverse[2],
    fontSize: Fontsize.md,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  removeIcon: {
    position: "absolute",
    top: 0,
    right: 8,
  },
});
