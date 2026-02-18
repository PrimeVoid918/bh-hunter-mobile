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
  occupancyTypeOptions,
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
// import AmenitiesList from "@/components/ui/AmenitiesAndTagsLists/TagListStateful";
import { TagListStateful } from "@/components/ui/AmenitiesAndTagsLists/TagListStateful";
import { BottomSheetTriggerField } from "@/components/ui/BottomSheet/BottomSheetTriggerField";
import { FormField } from "@/components/ui/FormFields/FormField";
import { Ionicons } from "@expo/vector-icons";

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
    //TODO add a delete button on context switcher abstraction

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
            <View style={s.header}>
              <View style={s.header_titleBackdrop}></View>

              <PressableImageFullscreen
                image={boardinghouse.thumbnail?.[0]}
                containerStyle={{ width: "100%", aspectRatio: 2 }}
                imageStyleConfig={{
                  resizeMode: "cover",
                  containerStyle: { borderRadius: BorderRadius.md },
                }}
              />

              <View style={[s.header_textContainer]}>
                <View style={[s.header_title]}>
                  <FormField
                    name="name"
                    control={control}
                    isEditing={globalIsEditing}
                    inputConfig={{
                      inputType: "singleLine",
                      placeholder: "Boarding House Name",
                      inputStyle: s.header_titleText,
                      inputContainerStyle: s.inputContainerStyle,
                    }}
                    textStyle={s.header_titleText}
                    textOverflow={{ ellipsize: true }}
                  />
                  <HStack
                    style={[
                      {
                        gap: 8,
                      },
                    ]}
                  >
                    <Ionicons name="star" size={20} color="gold" />
                    <Ionicons name="star" size={20} color="gold" />
                    <Ionicons name="star" size={20} color="gold" />
                    <Ionicons name="star" size={20} color="gold" />
                    <Ionicons name="star-half" size={20} color="gold" />
                    <Text style={s.rating}>(4.0)</Text>
                  </HStack>
                </View>
              </View>
            </View>

            <HStack
              style={{ marginTop: 16, alignItems: "flex-start", gap: 12 }}
            >
              <VStack style={{ flex: 1, gap: 12 }}>
                {/* Address */}
                <HStack style={[s.text_container]}>
                  <Text style={s.text_address}>Address: </Text>
                  <Ionicons name="location-outline" size={20} color="black" />
                  <FormField
                    name="address"
                    control={control}
                    isEditing={globalIsEditing}
                    inputConfig={{
                      inputType: "singleLine",
                      placeholder: "Enter address",
                      inputContainerStyle: s.inputContainerStyle,
                      inputStyle: s.text_address,
                    }}
                    textStyle={s.text_address}
                  />
                </HStack>

                {/* OccupancyType */}
                <BottomSheetTriggerField
                  name="occupancyType"
                  control={control}
                  label="Occupancy Type"
                  options={occupancyTypeOptions}
                  isEditing={globalIsEditing}
                  placeholder="Select Occupancy Type"
                  error={errors.occupancyType?.message}
                  onOpen={() => setIsActionSheetOpen(true)}
                />
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
            <Text style={s.sectionTitle}>Description: </Text>
            <FormField
              name="description"
              control={control}
              isEditing={globalIsEditing}
              inputConfig={{
                inputType: "paragraph",
                placeholder: "Enter description...",
                inputContainerStyle: s.inputContainerStyle,
              }}
            />

            {/* Amenities */}
            <VStack style={s.amenitiesContainer}>
              <Text style={s.sectionTitle}>Amenities: </Text>
              <TagListStateful
                name="amenities"
                items={AMENITIES}
                isEditing={globalIsEditing}
                form={{ getValues, setValue, watch }}
              />
            </VStack>
          </VStack>
        </VStack>

        <BottomSheetSelector
          options={occupancyTypeOptions}
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
  header: { gap: Spacing.md, position: "relative", overflow: "hidden" },
  body: { gap: Spacing.xl },

  header_textContainer: {
    position: "absolute",
    top: "60%",
    // borderWidth: 2,
    // borderColor: "white",
    // height: "35%",
    width: "110%",
    // top: "70%",
  },
  header_titleBackdrop: {
    position: "absolute",
    height: "35%",
    width: "110%",
    top: "70%",
    paddingLeft: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    left: -10,
    filter: [{ blur: 6 }],
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10,
    // elevation: 10, // Android
  },
  header_title: {
    position: "absolute",
    top: "65%",
    width: "100%",
    paddingLeft: Spacing.md,
    left: 0,
    borderColor: "green",
    zIndex: 2000,
    elevation: 2000, // Android
  },
  header_titleText: {
    fontSize: Fontsize.h1,
    fontWeight: "900",
  },

  text_container: {
    alignItems: "center",
  },
  text_title: {
    fontSize: Fontsize.xxl,
    fontWeight: "900",
  },
  text_address: {
    fontSize: Fontsize.md,
  },
  text_description: {
    fontSize: Fontsize.lg,
    lineHeight: 26,
  },
  rating: {
    fontSize: Fontsize.sm,
    fontWeight: "600",
  },
  viewRoomsBtn: {
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: Fontsize.lg,
    fontWeight: "600",
  },
  amenitiesContainer: {
    padding: 16,
    borderRadius: BorderRadius.md,
  },
  amenityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  amenityChipSelected: {
    backgroundColor: "#10b981",
  },
  amenityText: {
    fontSize: Fontsize.sm,
  },
  amenityTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  amenityDisplay: {
    padding: 10,
    borderRadius: BorderRadius.md,
    fontSize: Fontsize.md,
  },
  errorText: {
    color: "red",
    marginTop: 4,
    fontSize: Fontsize.sm,
  },
  inputContainerStyle: {
    borderWidth: 3,
    borderColor: "green",
    borderRadius: BorderRadius.md,
  },
});
