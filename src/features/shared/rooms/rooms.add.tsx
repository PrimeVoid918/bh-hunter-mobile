import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Input,
  InputField,
  VStack,
  FormControl,
  Box,
  Image,
  Button,
} from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";
import { BorderRadius, Colors, Fontsize, Spacing } from "@/constants";
import { pickImageExpo } from "@/infrastructure/image/image.service";
import {
  ROOM_FEATURE_TAGS,
  RoomFeatureTag,
} from "@/infrastructure/room/rooms.constants";
import ButtomSheetSelector from "@/components/ui/BottomSheet/BottomSheetSelector";
import {
  CreateRoomInput,
  CreateRoomInputSchema,
  RoomFurnishingType,
  RoomType,
} from "@/infrastructure/room/rooms.schema";
import { z } from "zod";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OwnerDashboardStackParamList } from "@/features/owner/screens/dashboard/navigation/dashboard.types";

type RoomWithIndex = CreateRoomInput & { index?: number };

export default function RoomsAddScreen({ route }: any) {
  const navigation =
    useNavigation<NativeStackNavigationProp<OwnerDashboardStackParamList>>();
  const { initialData, isEditing } = route.params || {};

  const defaultValues: CreateRoomInput = {
    roomNumber: "",
    description: "",
    roomType: RoomType.SINGLE_PRIVATE,
    furnishingType: RoomFurnishingType.UNFURNISHED,
    maxCapacity: 0,
    price: 0,
    tags: [],
    gallery: [],
    thumbnail: [],
  };

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
    if (initialData) reset(initialData);
    else reset(defaultValues);
  }, [initialData]);

  const [availableFeatureTage, setAvailableFeatureTage] = useState<string[]>(
    ROOM_FEATURE_TAGS.filter((f) => !defaultValues.tags?.includes(f)),
  );
  const selectedFeatureTags = watch("tags") ?? [];
  useEffect(() => {
    setAvailableFeatureTage(
      ROOM_FEATURE_TAGS.filter((f) => !selectedFeatureTags.includes(f)),
    );
  }, [selectedFeatureTags]);

  const handleSelectFeatureTag = (item: string) => {
    setValue("tags", [...(selectedFeatureTags || []), item]);
    setAvailableFeatureTage((prev) => prev.filter((a) => a !== item));
  };
  const handleRemoveFeatureTag = (item: string) => {
    setValue(
      "tags",
      (selectedFeatureTags || []).filter((a) => a !== item),
    );
    setAvailableFeatureTage((prev) => [...prev, item]);
  };

  const handlePickGalleryImages = async () => {
    const pick = await pickImageExpo(10);
    if (pick && pick.length) setValue("gallery", pick);
  };
  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const newGallery = [...(getValues("gallery") ?? [])];
    newGallery.splice(indexToRemove, 1);
    setValue("gallery", newGallery);
  };
  const handlePickThumbnailImage = async () => {
    const picked = await pickImageExpo(1);
    if (picked && picked.length)
      setValue("thumbnail", [picked[0]], { shouldValidate: true });
  };

  const handleFinalSubmit = (data: CreateRoomInput) => {
    // Here you can call API or pass data to parent
    console.log("Room Data Submitted:", data);
    navigation.goBack();
  };

  const [isFurnishingActionSheetOpen, setIsFurnishingActionSheetOpen] =
    useState(false);
  const [isRoomTypeActionSheetOpen, setIsRoomTypeActionSheetOpen] =
    useState(false);

  return (
    <View style={modalStyles.screenContainer}>
      {/* Header Close */}
      <TouchableOpacity
        style={modalStyles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={24} color="#333" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
        {/* Thumbnail Picker */}
        <Pressable onPress={handlePickThumbnailImage}>
          <Box style={modalStyles.thumbnailBox}>
            <Controller
              control={control}
              name="thumbnail"
              render={({ field: { value } }) => {
                const thumbnailImage = value?.[0] ?? null;
                return thumbnailImage ? (
                  <Image
                    source={{
                      uri: thumbnailImage.uri.startsWith("file://")
                        ? thumbnailImage.uri
                        : `file://${thumbnailImage.uri}`,
                    }}
                    style={{ width: "100%", height: "100%" }}
                    alt="Thumbnail"
                  />
                ) : (
                  <Text style={{ color: "#888", textAlign: "center" }}>
                    Tap to upload
                  </Text>
                );
              }}
            />
          </Box>
        </Pressable>

        {/* Room Form Fields */}
        <VStack style={{ gap: Spacing.md }}>
          {/* Room Number */}
          <FormControl isInvalid={!!errors.roomNumber}>
            <FormControl.Label>
              <Text style={s.Form_SubLabel}>Room Number</Text>
            </FormControl.Label>
            <Controller
              control={control}
              name="roomNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input borderColor="$coolGray400">
                  <InputField
                    placeholder="Room code"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </Input>
              )}
            />
            {errors.roomNumber && (
              <Text style={{ color: "red" }}>{errors.roomNumber.message}</Text>
            )}
          </FormControl>

          {/* Max Capacity */}
          <FormControl isInvalid={!!errors.maxCapacity}>
            <FormControl.Label>
              <Text style={s.Form_SubLabel}>Max Capacity</Text>
            </FormControl.Label>
            <Controller
              control={control}
              name="maxCapacity"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input borderColor="$coolGray400">
                  <InputField
                    value={value?.toString() ?? ""}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
                </Input>
              )}
            />
          </FormControl>

          {/* Price */}
          <FormControl isInvalid={!!errors.price}>
            <FormControl.Label>
              <Text style={s.Form_SubLabel}>Price</Text>
            </FormControl.Label>
            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input borderColor="$coolGray400">
                  <InputField
                    value={value?.toString() ?? ""}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
                </Input>
              )}
            />
          </FormControl>

          {/* Submit Button */}
          <Button
            onPress={handleSubmit(handleFinalSubmit)}
            style={{ marginTop: Spacing.md }}
          >
            <Text>Add Room</Text>
          </Button>
        </VStack>
      </ScrollView>

      {/* ActionSheets */}
      <ButtomSheetSelector<RoomType>
        values={Object.values(RoomType)}
        isOpen={isRoomTypeActionSheetOpen}
        onClose={() => setIsRoomTypeActionSheetOpen(false)}
        onSelect={(value) => {
          setValue("roomType", value);
          setIsRoomTypeActionSheetOpen(false);
        }}
      />
      <ButtomSheetSelector<RoomFurnishingType>
        values={Object.values(RoomFurnishingType)}
        isOpen={isFurnishingActionSheetOpen}
        onClose={() => setIsFurnishingActionSheetOpen(false)}
        onSelect={(value) => {
          setValue("furnishingType", value);
          setIsFurnishingActionSheetOpen(false);
        }}
      />
    </View>
  );
}

const modalStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.PrimaryLight[8],
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  closeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 2,
    backgroundColor: Colors.PrimaryLight[3],
    borderRadius: BorderRadius.circle,
    padding: 6,
  },
  thumbnailBox: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
});

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
});
