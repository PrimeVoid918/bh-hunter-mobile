import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import React, { useEffect } from "react";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import {
  Box,
  Button,
  FormControl,
  Image,
  Input,
  InputField,
  VStack,
} from "@gluestack-ui/themed";
import {
  BorderRadius,
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
} from "@/constants";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// * Redux
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { useCreateMutation } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import {
  BackendOccupancyType,
  CreateBoardingHouseInput,
  CreateBoardingHouseInputSchema,
  CreateBoardingHouseSchema,
  OccupancyType,
  occupancyTypeOptions,
} from "@/infrastructure/boarding-houses/boarding-house.schema";

import {
  AMENITIES,
  Amenity,
} from "@/infrastructure/boarding-houses/boarding-house.constants";

// * Routing
import { usePropertyNavigation } from "./navigation/properties.navigation.hooks";
import PropertiesRoomCreate from "./components/properties.room.create";
import { ScrollView } from "react-native-gesture-handler";

import { pickImageExpo } from "@/infrastructure/image/image.service";
import { expoStorageCleaner } from "@/infrastructure/utils/expo-utils/expo-utils.service";
import { Ionicons } from "@expo/vector-icons";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import BottomSheetSelector from "@/components/ui/BottomSheet/BottomSheetSelector";

export default function PropertiesCreateScreen() {
  useEffect(() => {
    return () => {
      expoStorageCleaner(["images", "documents"]);
    };
  }, []);

  const propertyNavigation = usePropertyNavigation();

  const [isActionSheetOpen, setIsActionSheetOpen] = React.useState(false);

  const { selectedUser: data } = useDynamicUserApi();
  const user = data;

  const [createBh, { isLoading, isError: isCreateBhError }] =
    useCreateMutation();
  const [currentHeight, setCurrentHeight] = React.useState<number>(0);

  // TODO: Abstract this later
  const initialDefaultValues: Partial<CreateBoardingHouseInput> = {
    name: "",
    address: "",
    description: "",
    ownerId: user?.id ?? 0,
    availabilityStatus: true,
    occupancyType: "MIXED",
    amenities: [],
    thumbnail: [],
    gallery: [],
    location: {
      type: "Point",
      coordinates: [1, 1],
    },
    rooms: [],
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<CreateBoardingHouseInput>({
    resolver: zodResolver(CreateBoardingHouseInputSchema) as any,
    defaultValues: initialDefaultValues,
  });
  const [availableAmenities, setAvailableAmenities] = React.useState<
    Array<string>
  >(
    AMENITIES.filter(
      (amenity) => !initialDefaultValues.amenities?.includes(amenity)
    )
  );
  const selectedAmenities = watch("amenities") ?? [];
  useEffect(() => {
    setAvailableAmenities(
      AMENITIES.filter((amenity) => !selectedAmenities.includes(amenity))
    );
  }, [selectedAmenities]);

  const handleSelectAmenity = (item: string) => {
    const update = [...(selectedAmenities || []), item] as Amenity[];
    setValue("amenities", update);
    setAvailableAmenities((prev) => prev.filter((a) => a !== item));
  };

  const handleRemoveAmenity = (item: string) => {
    const update = (selectedAmenities || []).filter((a) => a !== item);
    setValue("amenities", update as Amenity[]);
    setAvailableAmenities((prev) => [...prev, item]);
  };

  const onSubmit = async (data: CreateBoardingHouseInput) => {
    console.log("Submitting....");
    if (!data.location.coordinates) {
      alert("User ID is missing. Please log in.");
      return;
    }
    if (
      data.location.coordinates[0] === 1 &&
      data.location.coordinates[1] === 1
    ) {
      alert("Please set valid location coordinates.");
      return;
    }

    try {
      const transformedData = CreateBoardingHouseSchema.parse({
        ...data,
        rooms:
          data.rooms?.map((room) => ({
            ...room,
            maxCapacity: Number(room.maxCapacity),
            price: Number(room.price),
            tags: room.tags ?? [],
            gallery: room.gallery ?? [],
          })) || [],
      });

      await createBh(transformedData).unwrap();
      propertyNavigation.navigate("PropertiesHome");
    } catch (error) {
      console.error("Submission error:", error);
      alert(
        "Failed to create boarding house: " + (error?.error || "Unknown error")
      );
    }
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

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const newGallery = [...(getValues("gallery") ?? [])]; // get current value
    newGallery.splice(indexToRemove, 1); // remove item by index
    setValue("gallery", newGallery); // update the form
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

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer, s.main_container_style]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
    >
      {isLoading && <FullScreenLoaderAnimated />}
      <VStack space="md">
        <Box>
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
          <Pressable
            onPress={handleRemoveThumbnailImage}
            style={{
              backgroundColor: Colors.PrimaryLight[8],
              position: "absolute",
              top: 10,
              left: 10,
              borderRadius: BorderRadius.circle,
              padding: 2,
            }}
          >
            <Box>
              <Ionicons name="close" color="white" size={15} />
            </Box>
          </Pressable>
        </Box>

        {/* Name */}
        <FormControl isInvalid={!!errors.name}>
          <FormControl.Label>
            <Text style={[s.Form_Label]}>Property Name</Text>
          </FormControl.Label>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input borderColor="$coolGray400">
                <InputField
                  placeholder="Enter property name"
                  onChangeText={onChange}
                  style={[s.Form_Input_Placeholder]}
                  onBlur={onBlur}
                  value={value}
                />
              </Input>
            )}
          />
          {errors.name && (
            <Text style={{ color: "red" }}>{errors.name.message}</Text>
          )}
        </FormControl>

        {/* Address */}
        <FormControl isInvalid={!!errors.address}>
          <FormControl.Label>
            <Text style={[s.Form_Label]}>Address</Text>
          </FormControl.Label>
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input borderColor="$coolGray400">
                <InputField
                  placeholder="Enter address"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  style={[s.Form_Input_Placeholder]}
                />
              </Input>
            )}
          />
          {errors.address && (
            <Text style={{ color: "red" }}>{errors.address.message}</Text>
          )}
        </FormControl>

        {/* Description */}
        <VStack>
          <FormControl>
            <FormControl.Label>
              <Text style={[s.Form_Label]}>Description:</Text>
            </FormControl.Label>
            <Controller
              control={control}
              name="description"
              rules={{
                maxLength: {
                  value: 500,
                  message: "Description must be 500 characters or less",
                },
              }}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <Input
                  borderColor="$coolGray400"
                  style={{
                    height: currentHeight >= 0 ? "auto" : currentHeight, // Dynamic height
                    // height: "auto", // Dynamic height
                    paddingTop: 10,
                    paddingBottom: 10,
                    overflow: "scroll", // Ensure scrollbar appears
                  }}
                >
                  <InputField
                    numberOfLines={5}
                    multiline={true}
                    onContentSizeChange={(e) => {
                      const newHeight = Math.min(
                        e.nativeEvent.contentSize.height,
                        120
                      );
                      setCurrentHeight(newHeight);
                    }}
                    style={[s.Form_Input_Placeholder]}
                    placeholder="Enter Description of your property"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                </Input>
              )}
            />
          </FormControl>
        </VStack>
        {/* Occupancy Type */}
        <VStack>
          <FormControl isInvalid={!!errors.occupancyType}>
            <FormControl.Label>
              <Text style={[s.Form_SubLabel]}>OccupancyType Type</Text>
            </FormControl.Label>

            <Controller
              control={control}
              name="occupancyType"
              rules={{ required: "BH Occupancy Type is required" }}
              render={({ field: { onChange, value } }) => (
                <View style={{ marginBottom: 10 }}>
                  <Button onPress={() => setIsActionSheetOpen(true)}>
                    <Text>{value || "Select Room Type"}</Text>
                  </Button>

                  {errors?.occupancyType && (
                    <Text style={{ color: "red", marginTop: 4 }}>
                      {errors.occupancyType.message}
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
        </VStack>

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
                              onPress={() => handleRemoveGalleryImage(index)}
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

        {/* Amenities */}
        <VStack
          style={{
            gap: Spacing.md,
            borderColor: Colors.PrimaryLight[4],
            borderWidth: 1,
            padding: Spacing.sm,
            borderRadius: BorderRadius.md,
          }}
        >
          {/* Section Title */}
          <Text style={[s.Form_Label]}>Amenities</Text>

          {/* Available Amenities Label */}
          <Text style={[s.Form_SubLabel]}>Tap to select:</Text>
          <ScrollView
            style={{ height: 150 }}
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "flex-start",
              alignContent: "flex-start",
            }}
          >
            {availableAmenities.map((item, index) => (
              <Pressable key={index} onPress={() => handleSelectAmenity(item)}>
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

          {/* Selected Amenities Label */}
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
          >
            {selectedAmenities.length ? (
              selectedAmenities.map((item, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleRemoveAmenity(item)}
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
        </VStack>

        {/* Location */}
        <VStack>
          <Controller
            control={control}
            name="location.coordinates"
            render={({ field: { value } }) => (
              <Pressable
                style={{
                  borderRadius: BorderRadius.md,
                  padding: 5,
                  backgroundColor: Colors.PrimaryLight[6],
                }}
                onPress={() => {
                  propertyNavigation.navigate("PropertyLocationPicker", {
                    onSelect: (coords: {
                      latitude: number;
                      longitude: number;
                    }) => {
                      setValue(
                        "location.coordinates",
                        [coords.longitude, coords.latitude],
                        { shouldValidate: true }
                      );
                    },
                  });
                }}
              >
                <Text style={[s.Form_Label]}>Set Location</Text>
                {value && value[0] !== 1 && value[1] !== 1 ? (
                  <Text style={[s.generic_text]}>
                    {value[0]}, {value[1]}
                  </Text>
                ) : (
                  <Text style={[s.generic_text]}>No location selected</Text>
                )}
              </Pressable>
            )}
          />
          {errors.location?.coordinates && (
            <Text style={{ color: "red" }}>
              {errors.location.coordinates.message}
            </Text>
          )}
        </VStack>

        {/* Rooms */}
        <Controller
          name="rooms"
          control={control}
          render={({ field }) => (
            <PropertiesRoomCreate
              rooms={field.value || []}
              setRooms={(newRooms) => {
                setValue("rooms", newRooms, { shouldValidate: true });
              }}
            />
          )}
        />

        {/* Submit Button */}
        <View style={{ marginBottom: Spacing.xxl }}>
          <FormControl>
            <Pressable
              onPress={() => {
                console.log("Clicked the submit...");
                console.log("Current form rooms:", watch("rooms"));
                console.log("Current form errors:", errors);
                handleSubmit(onSubmit)();
              }}
              style={{
                backgroundColor: "#1E90FF",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Submit -
              </Text>
            </Pressable>
          </FormControl>
        </View>
        <BottomSheetSelector<BackendOccupancyType>
          options={occupancyTypeOptions}
          isOpen={isActionSheetOpen}
          onClose={() => setIsActionSheetOpen(false)}
          onSelect={(value) => {
            setValue("occupancyType", value);
            setIsActionSheetOpen(false);
          }}
        />
      </VStack>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  main_container_style: {
    padding: Spacing.md,
  },
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent dark background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, // ensure it's above everything
  },
});
