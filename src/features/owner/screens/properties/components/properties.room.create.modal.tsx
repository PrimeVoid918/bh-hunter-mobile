import { Button } from "@gluestack-ui/themed";
import { Overlay } from "@gluestack-ui/overlay";

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  Input,
  InputField,
  VStack,
  FormControl,
  Box,
  Image,
} from "@gluestack-ui/themed";
import {
  CreateRoomInput,
  CreateRoomInputSchema,
  RoomFurnishingType,
  roomFurnishingTypeOptions,
  RoomType,
  roomTypeOptions,
} from "@/infrastructure/room/rooms.schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollView, Pressable } from "react-native";
import { BorderRadius, Colors, Fontsize, Spacing } from "@/constants";
import {
  ROOM_FEATURE_TAGS,
  RoomFeatureTag,
} from "@/infrastructure/room/rooms.constants";
import { Ionicons } from "@expo/vector-icons";
import { pickImageExpo } from "@/infrastructure/image/image.service";
import ButtomSheetSelector from "@/components/ui/BottomSheet/BottomSheetSelector";
import z from "zod";

type RoomWithIndex = CreateRoomInput & { index?: number };
interface PropertiesRoomCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoomInput, indexToReplace?: number) => void;
  // initialData?: RoomWithIndex;
  initialData?: CreateRoomInput & { index: number };
  isEditing?: boolean;
}

export default function PropertiesRoomCreateModal({
  visible,
  onClose,
  onSubmit,
  initialData,
  isEditing,
}: PropertiesRoomCreateModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [isFurnishingActionSheetOpen, setIsFurnishingActionSheetOpen] =
    useState(false);
  const [isRoomTypeActionSheetOpen, setIsRoomTypeActionSheetOpen] =
    useState(false);
  const [selectedType, setSelectedType] = useState<string>("");

  const defaultValues: CreateRoomInput = {
    roomNumber: "",
    description: "",
    roomType: RoomType.BED_SPACER,
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
    if (initialData) {
      reset(initialData); // for edit mode
    } else {
      reset(defaultValues); // for add mode
    }
  }, [initialData, visible]);

  const [availableFeatureTage, setAvailableFeatureTage] = useState<
    Array<string>
  >(
    ROOM_FEATURE_TAGS.filter(
      (feature) => !defaultValues.tags?.includes(feature),
    ),
  );
  const selectedFeatureTags = watch("tags") ?? [];
  useEffect(() => {
    setAvailableFeatureTage(
      ROOM_FEATURE_TAGS.filter(
        (feature) => !selectedFeatureTags.includes(feature),
      ),
    );
  }, [selectedFeatureTags]);
  const handleSelectFeatureTag = (item: string) => {
    const update = [...(selectedFeatureTags || []), item] as RoomFeatureTag[];
    setValue("tags", update);
    setAvailableFeatureTage((prev) => prev.filter((a) => a !== item));
  };
  const handleRemoveFeatureTag = (item: string) => {
    const update = (selectedFeatureTags || []).filter((a) => a !== item);
    setValue("tags", update as RoomFeatureTag[]);
    setAvailableFeatureTage((prev) => [...prev, item]);
  };

  const handlePickGalleryImages = async () => {
    try {
      const pick = await pickImageExpo(10);
      if (pick && pick.length > 0) {
        setValue("gallery", pick);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Invalid image file");
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const newGallery = [...(getValues("gallery") ?? [])]; // get current value
    newGallery.splice(indexToRemove, 1); // remove item by index
    setValue("gallery", newGallery); // update the form
  };

  const handleFinalSubmit = (data: CreateRoomInput) => {
    const index = isEditing ? initialData?.index : undefined;
    onSubmit(data, index);
    onClose();
  };

  const handlePickThumbnailImage = async () => {
    try {
      const picked = await pickImageExpo(1);
      console.log("Picked images:", picked); // 👈 log this
      if (picked && picked.length > 0) {
        setValue("thumbnail", [picked[0]], { shouldValidate: true });
      }
    } catch (err) {
      console.log("Pick error:", err);
      Alert.alert("Error", "Invalid image file");
    }
  };
  const handleRemoveThumbnailImage = () => {
    setValue("thumbnail", []);
  };

  return (
    <>
      <Overlay isOpen={visible} onRequestClose={onClose}>
        <View style={[modalStyles.overlay]}>
          <View style={[modalStyles.container]}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={[modalStyles.closeButton]}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            {/* Modal Form Content */}
            <ScrollView contentContainerStyle={{ paddingBottom: Spacing.sm }}>
              <Pressable onPress={handlePickThumbnailImage}>
                <Box
                  style={{
                    width: "75%",
                    height: 200,
                    borderRadius: 8,
                    backgroundColor: "#f0f0f0",
                    overflow: "hidden",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Controller
                    control={control}
                    name="thumbnail"
                    render={({ field: { value } }) => {
                      const thumbnailImage =
                        value && value.length > 0 ? value[0] : null;

                      return (
                        <>
                          {thumbnailImage ? (
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
                            <Text style={{ color: "#888" }}>Tap to upload</Text>
                          )}
                        </>
                      );
                    }}
                  />
                </Box>
              </Pressable>
              {/* Room Number */}
              <FormControl isInvalid={!!errors.roomNumber}>
                <FormControl.Label>
                  <Text style={[s.Form_SubLabel]}>Room Number</Text>
                </FormControl.Label>
                <Controller
                  control={control}
                  name="roomNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input borderColor="$coolGray400">
                      <InputField
                        placeholder="Room code"
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        style={[s.Form_Input_Placeholder]}
                      />
                    </Input>
                  )}
                />
                {errors.roomNumber && (
                  <Text style={{ color: "red" }}>
                    {errors.roomNumber.message}
                  </Text>
                )}
              </FormControl>

              {/* Max Capacity */}
              <FormControl isInvalid={!!errors.maxCapacity}>
                <FormControl.Label>
                  <Text style={[s.Form_SubLabel]}>Max Capacity</Text>
                </FormControl.Label>
                <Controller
                  control={control}
                  name="maxCapacity"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input borderColor="$coolGray400">
                      <InputField
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value?.toString() ?? ""}
                        keyboardType="numeric"
                        style={[s.Form_Input_Placeholder]}
                      />
                    </Input>
                  )}
                />
                {errors.maxCapacity && (
                  <Text style={{ color: "red" }}>
                    {errors.maxCapacity.message}
                  </Text>
                )}
              </FormControl>

              {/* Price */}
              <FormControl isInvalid={!!errors.price}>
                <FormControl.Label>
                  <Text style={[s.Form_SubLabel]}>Price</Text>
                </FormControl.Label>
                <Controller
                  control={control}
                  name="price"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input borderColor="$coolGray400">
                      <InputField
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value?.toString() ?? ""}
                        keyboardType="numeric"
                        style={[s.Form_Input_Placeholder]}
                      />
                    </Input>
                  )}
                />
                {errors.price && (
                  <Text style={{ color: "red" }}>{errors.price.message}</Text>
                )}
              </FormControl>

              {/* Room Description */}
              <FormControl
                isInvalid={!!errors.description}
                style={{ paddingBottom: Spacing.md }}
              >
                <FormControl.Label>
                  <Text style={[s.Form_SubLabel]}>Description</Text>
                </FormControl.Label>
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input borderColor="$coolGray400">
                      <InputField
                        placeholder=""
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        style={[s.Form_Input_Placeholder]}
                      />
                    </Input>
                  )}
                />
                {errors.roomNumber && (
                  <Text style={{ color: "red" }}>
                    {errors.roomNumber.message}
                  </Text>
                )}
              </FormControl>

              {/* Room Furnished type */}
              <FormControl isInvalid={!!errors.furnishingType}>
                <FormControl.Label>
                  <Text style={[s.Form_SubLabel]}>Room Furnishing</Text>
                </FormControl.Label>

                <Controller
                  control={control}
                  name="furnishingType"
                  rules={{ required: "Room Furnishing is required" }}
                  render={({ field: { onChange, value } }) => (
                    <View style={{ marginBottom: 10 }}>
                      <Button
                        onPress={() => setIsFurnishingActionSheetOpen(true)}
                      >
                        <Text>{value || "Select Room Furnishing"}</Text>
                      </Button>

                      {errors?.furnishingType && (
                        <Text style={{ color: "red", marginTop: 4 }}>
                          {errors.furnishingType.message}
                        </Text>
                      )}

                      {value && (
                        <Text
                          style={{
                            color: Colors.TextInverse[2],
                            fontSize: Fontsize.md,
                            marginTop: 6,
                            textAlign: "center",
                          }}
                        >
                          Selected: {value}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </FormControl>

              {/* Room type */}
              <FormControl isInvalid={!!errors.roomType}>
                <FormControl.Label>
                  <Text style={[s.Form_SubLabel]}>Room Type</Text>
                </FormControl.Label>

                <Controller
                  control={control}
                  name="roomType"
                  rules={{ required: "Room Type is required" }}
                  render={({ field: { onChange, value } }) => (
                    <View style={{ marginBottom: 10 }}>
                      <Button
                        onPress={() => setIsRoomTypeActionSheetOpen(true)}
                      >
                        <Text>{value || "Select Room Type"}</Text>
                      </Button>

                      {errors?.roomType && (
                        <Text style={{ color: "red", marginTop: 4 }}>
                          {errors.roomType.message}
                        </Text>
                      )}

                      {value && (
                        <Text
                          style={{
                            color: Colors.TextInverse[2],
                            fontSize: Fontsize.md,
                            marginTop: 6,
                            textAlign: "center",
                          }}
                        >
                          Selected: {value}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </FormControl>

              {/* Tags */}
              <VStack
                style={{
                  gap: Spacing.md,
                  borderColor: Colors.PrimaryLight[4],
                  borderWidth: 1,
                  padding: Spacing.sm,
                  borderRadius: BorderRadius.md,
                  // marginBottom: Spacing.md,
                }}
              >
                <Text style={[s.Form_SubLabel]}>Select Room Amenities:</Text>
                <ScrollView
                  style={{ height: 150 }}
                  contentContainerStyle={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 10,
                    justifyContent: "flex-start",
                    alignContent: "flex-start",
                  }}
                  nestedScrollEnabled={true} // important when inside another scrollable parent
                  keyboardShouldPersistTaps="handled" // helps with form fields
                >
                  {availableFeatureTage.map((item, index) => (
                    <Pressable
                      key={index}
                      onPress={() => handleSelectFeatureTag(item)}
                    >
                      <Box
                        style={{
                          borderRadius: BorderRadius.md,
                          padding: 5,
                          backgroundColor: Colors.PrimaryLight[6],
                        }}
                      >
                        <Text style={[s.generic_text]}>{item}</Text>
                      </Box>
                    </Pressable>
                  ))}
                </ScrollView>

                <Text style={[s.Form_SubLabel, { marginTop: Spacing.md }]}>
                  Selected Amenities:
                </Text>
                <ScrollView
                  style={{ height: 150 }}
                  contentContainerStyle={{
                    gap: 10,
                    padding: Spacing.sm,
                    backgroundColor: Colors.PrimaryLight[7],
                  }}
                  nestedScrollEnabled={true} // important when inside another scrollable parent
                  keyboardShouldPersistTaps="handled" // helps with form fields
                >
                  {selectedFeatureTags.length ? (
                    selectedFeatureTags.map((item, index) => (
                      <Pressable
                        key={index}
                        onPress={() => handleRemoveFeatureTag(item)}
                      >
                        <Box
                          style={{
                            borderRadius: BorderRadius.md,
                            padding: 5,
                            backgroundColor: Colors.PrimaryLight[6],
                          }}
                        >
                          <Text style={[s.generic_text]}>{item}</Text>
                        </Box>
                      </Pressable>
                    ))
                  ) : (
                    <Text style={[s.generic_text]}>No amenities selected</Text>
                  )}
                </ScrollView>
                {/* image selection */}
                <VStack>
                  <VStack>
                    <Pressable
                      onPress={handlePickGalleryImages}
                      style={{
                        padding: Spacing.sm,
                        alignSelf: "flex-start",
                        backgroundColor: Colors.PrimaryLight[6],
                        borderRadius: BorderRadius.md,
                      }}
                    >
                      <Text style={[s.generic_text, { fontSize: Fontsize.md }]}>
                        Select Images
                      </Text>
                    </Pressable>
                    <Controller
                      control={control}
                      name="gallery"
                      render={({ field: { value } }) => {
                        const galleryImage = value || [];

                        return (
                          <>
                            <ScrollView
                              horizontal
                              style={{
                                width: "100%",
                                height: 100,
                                marginTop: 10,
                                marginBottom: 10,
                              }}
                              contentContainerStyle={{
                                marginTop: 10,
                                flexDirection: "row",
                                alignItems: "center",
                                paddingHorizontal: 8,
                              }}
                            >
                              {galleryImage.length > 0 ? (
                                galleryImage.map((image, index) => (
                                  <View key={index}>
                                    <Image
                                      source={{
                                        uri: image.uri.startsWith("file://")
                                          ? image.uri
                                          : `file://${image.uri}`,
                                      }}
                                      style={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: 8,
                                        marginRight: 8,
                                        backgroundColor: "#ccc",
                                      }}
                                      alt={`Gallery image ${index + 1}`}
                                    />
                                    <Pressable
                                      onPress={() =>
                                        handleRemoveGalleryImage(index)
                                      }
                                      style={{
                                        position: "absolute",
                                        top: "0%",
                                        right: "9%",
                                      }}
                                    >
                                      <Ionicons
                                        name="close-circle"
                                        size={20}
                                        color="white"
                                      />
                                    </Pressable>
                                  </View>
                                ))
                              ) : (
                                <Text style={{ color: "white" }}>
                                  No Images Selected
                                </Text>
                              )}
                            </ScrollView>
                          </>
                        );
                      }}
                    />
                  </VStack>
                </VStack>

                {/* Submit */}
                <VStack
                  style={{
                    alignItems: "center",
                    borderRadius: BorderRadius.md,
                    backgroundColor: Colors.PrimaryLight[4],
                    padding: 10,
                    justifyContent: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      handleSubmit(handleFinalSubmit)();
                      console.log("clicked..?");
                    }}
                  >
                    <Text
                      style={{
                        color: "black",
                        textAlign: "center",
                        fontSize: 18,
                      }}
                    >
                      Add Room
                    </Text>
                  </TouchableOpacity>
                </VStack>
              </VStack>
            </ScrollView>
          </View>
        </View>
        {/* </Modal> */}
      </Overlay>
      <ButtomSheetSelector
        options={roomTypeOptions}
        isOpen={isRoomTypeActionSheetOpen}
        onClose={() => setIsRoomTypeActionSheetOpen(false)}
        onSelect={(value) => {
          setValue("roomType", value);
          setIsRoomTypeActionSheetOpen(false);
        }}
      />
      <ButtomSheetSelector
        options={roomFurnishingTypeOptions}
        isOpen={isFurnishingActionSheetOpen}
        onClose={() => setIsFurnishingActionSheetOpen(false)}
        onSelect={(value) => {
          setValue("furnishingType", value);
          setIsFurnishingActionSheetOpen(false);
        }}
      />
    </>
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

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    // backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    // zIndex: 1,
  },
  container: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: Colors.PrimaryLight[8],
    borderRadius: 10,
    padding: 20,
    elevation: 4,
  },
  closeButton: {
    backgroundColor: Colors.PrimaryLight[3],
    borderRadius: BorderRadius.circle,
    position: "absolute",
    right: 10,
    top: 10,
    // zIndex: 1,
  },
});
