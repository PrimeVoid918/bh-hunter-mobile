import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import {
  Colors,
  Spacing,
  GlobalStyle,
  Fontsize,
  BorderRadius,
} from "@/constants";
import {
  Box,
  FormControl,
  Input,
  InputField,
  HStack,
  VStack,
  Button,
} from "@gluestack-ui/themed";
import { useNavigation, useIsFocused } from "@react-navigation/native";

// UI Components
import ImageCarousel from "@/components/ui/ImageCarousel";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";
import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";
import Container from "@/components/layout/Container/Container";
import AutoExpandingInput from "@/components/ui/AutoExpandingInputComponent";

// Form & Validation
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BackendOccupancyType,
  OccupancyType,
  PatchBoardingHouseSchema,
  type PatchBoardingHouseInput,
} from "@/infrastructure/boarding-houses/boarding-house.schema";

// RTK Query
import {
  useGetOneQuery as useGetOneBoardingHouses,
  usePatchMutation,
} from "@/infrastructure/boarding-houses/boarding-house.redux.api";

// Constants
import {
  AMENITIES,
  type Amenity,
} from "@/infrastructure/boarding-houses/boarding-house.constants";
import { useEditStateContextSwitcherButtons } from "@/components/ui/Portals/GlobalEditStateContextSwitcherButtonsProvider";
import { useDecisionModal } from "@/components/ui/FullScreenDecisionModal";
import BottomSheetSelector from "@/components/ui/BottomSheet/BottomSheetSelector";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OwnerDashboardStackParamList } from "../dashboard/navigation/dashboard.types";

export default function BoardingHouseDetailsScreen({ bhID }: { bhID: number }) {
  const [refreshing, setRefreshing] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = React.useState(false);

  const {
    showButtons,
    hideButtons,
    isEditing: globalIsEditing,
    setIsEditing: setGlobalIsEditing,
  } = useEditStateContextSwitcherButtons();
  const { showModal } = useDecisionModal();
  const navigation =
    useNavigation<NativeStackNavigationProp<OwnerDashboardStackParamList>>();
  const isFocused = useIsFocused();

  //* ── Fetch Data ──
  const {
    data: boardinghouse,
    isLoading: isLoadingBH,
    isError: isErrorBH,
    refetch,
  } = useGetOneBoardingHouses(bhID);

  const [patchBoardingHouse] = usePatchMutation();

  //* ── Form Setup ──
  const {
    control,
    reset,
    getValues,
    setValue,
    watch,
    formState: { dirtyFields, errors },
  } = useForm<PatchBoardingHouseInput>({
    resolver: zodResolver(PatchBoardingHouseSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      amenities: [],
      availabilityStatus: true,
      occupancyType: "MIXED",
    },
  });

  //* Reset form when data loads
  useEffect(() => {
    if (boardinghouse) {
      reset({
        name: boardinghouse.name,
        address: boardinghouse.address,
        description: boardinghouse.description ?? "",
        amenities: boardinghouse.amenities ?? [],
        availabilityStatus: boardinghouse.availabilityStatus,
        occupancyType: boardinghouse.occupancyType,
      });
    }
  }, [boardinghouse, reset]);

  // Watch current selected amenities
  const selectedAmenities = watch("amenities") ?? [];

  // ── Global Edit Buttons (No stale data!) ──
  useEffect(() => {
    if (!isFocused) {
      hideButtons();
      return;
    }

    showButtons({
      onEdit: () => {
        setGlobalIsEditing(true);
      },

      onSave: () => {
        showModal({
          title: "Save Changes?",
          message: "This will update your boarding house listing.",
          cancelText: "Cancel",
          confirmText: "Save",
          onConfirm: async () => {
            try {
              const payload = getValues();
              await patchBoardingHouse({ id: bhID, data: payload }).unwrap();
              Alert.alert("Success", "Changes saved!");
              console.log("is editing?: ", globalIsEditing);
              setGlobalIsEditing(false);
            } catch (err: any) {
              const message = Array.isArray(err?.data?.message)
                ? err.data.message.join("\n")
                : err?.data?.message || "Failed to save";
              Alert.alert("Error", message);
            }
          },
        });
      },

      onDiscard: () => {
        showModal({
          title: "Discard Changes?",
          message: "All unsaved changes will be lost.",
          cancelText: "Cancel",
          confirmText: "Discard",
          onConfirm: () => {
            reset();
            setGlobalIsEditing(false); // ← Only exit after confirm
          },
        });
      },
    });

    return () => hideButtons();
  }, [
    isFocused,
    showButtons,
    hideButtons,
    showModal,
    getValues,
    reset,
    patchBoardingHouse,
    bhID,
  ]);

  // ── Amenity Toggle (Now 100% type-safe!) ──
  const toggleAmenity = (amenity: Amenity) => {
    const current = getValues("amenities") ?? [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];

    setValue("amenities", updated, { shouldDirty: true });
  };

  // ── Other Handlers ──
  const goToRooms = () => {
    navigation.navigate("RoomsListMainScreen", { paramsId: bhID });
  };

  const onRefresh = () => {
    setRefreshing(true);
    refetch?.();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // ── Early Returns ──
  if (isLoadingBH || !boardinghouse) return <FullScreenLoaderAnimated />;
  if (isErrorBH) return <FullScreenErrorModal />;

  // ── Render ──
  return (
    <StaticScreenWrapper
      style={GlobalStyle.GlobalsContainer}
      contentContainerStyle={GlobalStyle.GlobalsContentContainer}
      wrapInScrollView={false}
    >
      <Container refreshing={refreshing} onRefresh={onRefresh}>
        <VStack style={[GlobalStyle.GlobalsContainer, s.container]}>
          {/* Header */}
          <View style={s.header}>
            <PressableImageFullscreen
              image={boardinghouse.thumbnail?.[0]}
              containerStyle={{ width: "100%", aspectRatio: 1.2 }}
              imageStyleConfig={{
                resizeMode: "cover",
                containerStyle: { borderRadius: BorderRadius.md },
              }}
            />

            <HStack style={{ marginTop: 12, gap: 8 }}>
              <Text style={s.rating}>*****</Text>
              <Text style={s.rating}>(4.0)</Text>
            </HStack>

            <HStack
              style={{ marginTop: 16, alignItems: "flex-start", gap: 12 }}
            >
              <VStack style={{ flex: 1, gap: 12 }}>
                {/* Name */}
                <FormControl isInvalid={!!errors.name}>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field }) =>
                      globalIsEditing ? (
                        <Input borderColor="$green500">
                          <InputField
                            value={field.value ?? ""}
                            onChangeText={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="Boarding house name"
                            style={[s.text_title, { fontWeight: "bold" }]}
                          />
                        </Input>
                      ) : (
                        <Text style={s.text_title}>{boardinghouse.name}</Text>
                      )
                    }
                  />
                  {errors.name && (
                    <Text style={s.errorText}>{errors.name.message}</Text>
                  )}
                </FormControl>

                {/* Address */}
                <FormControl isInvalid={!!errors.address}>
                  <Controller
                    control={control}
                    name="address"
                    render={({ field }) =>
                      globalIsEditing ? (
                        <Input borderColor="$green500">
                          <InputField
                            value={field.value ?? ""}
                            onChangeText={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="Enter address"
                            style={s.text_address}
                          />
                        </Input>
                      ) : (
                        <Text style={s.text_address}>
                          {boardinghouse.address}
                        </Text>
                      )
                    }
                  />
                  {errors.address && (
                    <Text style={s.errorText}>{errors.address.message}</Text>
                  )}
                </FormControl>

                {/* OccupancyType */}
                <FormControl isInvalid={!!errors.occupancyType}>
                  {/* <FormControl.Label>
                    <Text style={[]}>OccupancyType Type</Text>
                  </FormControl.Label> */}

                  <Controller
                    control={control}
                    name="occupancyType"
                    rules={{ required: "BH Occupancy Type is required" }}
                    render={({ field: { onChange, value } }) => (
                      <View>
                        {globalIsEditing ? (
                          <Button onPress={() => setIsActionSheetOpen(true)}>
                            <Text>{value || "Select Room Type"}</Text>
                          </Button>
                        ) : (
                          <Text
                            style={{
                              color: Colors.TextInverse[2],
                              fontSize: Fontsize.md,
                            }}
                          >
                            OccupancyType: {value}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                </FormControl>
              </VStack>

              <Button onPress={goToRooms}>
                <Text style={{ color: "white", fontWeight: "600" }}>
                  View Rooms
                </Text>
              </Button>
            </HStack>
          </View>

          {/* Body */}
          <VStack style={s.body}>
            <ImageCarousel
              variant="secondary"
              images={boardinghouse.gallery ?? []}
            />

            {/* Description */}
            <FormControl>
              <Controller
                control={control}
                name="description"
                render={({ field }) =>
                  globalIsEditing ? (
                    <AutoExpandingInput
                      value={field.value ?? ""}
                      onChangeText={field.onChange}
                      placeholder="Enter description..."
                      style={s.text_description}
                      containerStyle={{
                        padding: 14,
                        borderColor: "#10b981",
                        borderWidth: 2,
                        backgroundColor: Colors.PrimaryLight[7],
                        borderRadius: BorderRadius.md,
                      }}
                    />
                  ) : (
                    <Text style={s.text_description}>
                      {boardinghouse.description || "No description provided."}
                    </Text>
                  )
                }
              />
            </FormControl>

            {/* Amenities */}
            <VStack style={s.amenitiesContainer}>
              <Text style={s.sectionTitle}>Additional Information:</Text>

              {/* ! refactorable into a component for multiple selection of ameneties */}
              {globalIsEditing ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 12 }}
                >
                  <HStack style={{ gap: 12, paddingRight: 20 }}>
                    {AMENITIES.map((amenity) => {
                      const isSelected = selectedAmenities.includes(amenity);
                      return (
                        <Pressable
                          key={amenity}
                          onPress={() => toggleAmenity(amenity)}
                        >
                          <Box
                            style={[
                              s.amenityChip,
                              isSelected && s.amenityChipSelected,
                            ]}
                          >
                            <Text
                              style={
                                isSelected
                                  ? s.amenityTextSelected
                                  : s.amenityText
                              }
                            >
                              {amenity}
                            </Text>
                          </Box>
                        </Pressable>
                      );
                    })}
                  </HStack>
                  {/*! refactorable into a component for multiple selection of ameneties */}
                </ScrollView>
              ) : (
                <VStack style={{ gap: 8, marginTop: 12 }}>
                  {boardinghouse.amenities?.length ? (
                    boardinghouse.amenities.map((amenity) => (
                      <Text key={amenity} style={s.amenityDisplay}>
                        {amenity}
                      </Text>
                    ))
                  ) : (
                    <Text style={{ color: Colors.TextInverse[3] }}>
                      No amenities listed
                    </Text>
                  )}
                </VStack>
              )}
            </VStack>
          </VStack>
        </VStack>
        <BottomSheetSelector<BackendOccupancyType>
          values={["MALE", "FEMALE", "MIXED"] as const}
          isOpen={isActionSheetOpen}
          onClose={() => setIsActionSheetOpen(false)}
          onSelect={(value) => {
            setValue("occupancyType", value, { shouldDirty: true });
            setIsActionSheetOpen(false);
          }}
        />
      </Container>
    </StaticScreenWrapper>
  );
}

// ── Styles ──
const s = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md, gap: Spacing.md },
  header: { gap: Spacing.md },
  body: { gap: Spacing.xl },
  text_title: {
    fontSize: Fontsize.xxl,
    fontWeight: "900",
    color: Colors.TextInverse[1],
  },
  text_address: {
    fontSize: Fontsize.md,
    color: Colors.TextInverse[2],
  },
  text_description: {
    fontSize: Fontsize.lg,
    color: Colors.TextInverse[2],
    lineHeight: 26,
  },
  rating: {
    fontSize: Fontsize.sm,
    color: Colors.TextInverse[1],
  },
  viewRoomsBtn: {
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: Fontsize.lg,
    fontWeight: "600",
    color: Colors.TextInverse[1],
  },
  amenitiesContainer: {
    backgroundColor: Colors.PrimaryLight[7],
    padding: 16,
    borderRadius: BorderRadius.md,
  },
  amenityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.PrimaryLight[6],
    borderRadius: BorderRadius.md,
  },
  amenityChipSelected: {
    backgroundColor: "#10b981",
  },
  amenityText: {
    color: Colors.TextInverse[1],
    fontSize: Fontsize.sm,
  },
  amenityTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  amenityDisplay: {
    backgroundColor: Colors.PrimaryLight[8],
    padding: 10,
    borderRadius: BorderRadius.md,
    fontSize: Fontsize.md,
    color: Colors.TextInverse[1],
  },
  errorText: {
    color: "red",
    marginTop: 4,
    fontSize: Fontsize.sm,
  },
});
