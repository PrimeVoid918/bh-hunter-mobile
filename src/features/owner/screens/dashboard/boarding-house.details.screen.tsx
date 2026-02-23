import BoardingHouseDetailsScreenComponent from "../components/boarding-house.details.screen";
import { RouteProp, useRoute } from "@react-navigation/native";

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
import BottomSheetSelector from "@/components/ui/BottomSheet/BottomSheetSelector";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OwnerDashboardStackParamList } from "../dashboard/navigation/dashboard.types";
// import AmenitiesList from "@/components/ui/AmenitiesAndTagsLists/TagListStateful";
import { TagListStateful } from "@/components/ui/AmenitiesAndTagsLists/TagListStateful";
import { BottomSheetTriggerField } from "@/components/ui/BottomSheet/BottomSheetTriggerField";
import { FormField } from "@/components/ui/FormFields/FormField";
import { Ionicons } from "@expo/vector-icons";
import BoardingHouseDetailsRender from "../../../shared/boarding-house/BoardingHouseDetailsRender";
import ReviewSection from "@/components/ui/Reviews/ReviewSection";

type RouteProps = RouteProp<
  OwnerDashboardStackParamList,
  "BoardingHouseDetailsScreen"
>;

export default function BoardingHouseDetailsScreen() {
  const route = useRoute<RouteProps>();
  const { id: bhId } = route.params;

  const [refreshing, setRefreshing] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = React.useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<OwnerDashboardStackParamList>>();
  const isFocused = useIsFocused();

  //* ── Fetch Data ──
  const {
    data: boardinghouse,
    isLoading: isLoadingBH,
    isError: isErrorBH,
    refetch,
  } = useGetOneBoardingHouses(bhId);

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
  useEffect(() => {}, [isFocused, getValues, reset, patchBoardingHouse, bhId]);

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
    if (!bhId) return "Invald Boarding House Number";
    navigation.navigate("RoomsListMainScreen", { paramsId: bhId! });
  };

  const onRefresh = () => {
    setRefreshing(true);
    refetch?.();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // ── Render ──
  return (
    <StaticScreenWrapper
      variant="list"
      refreshing={refreshing}
      onRefresh={onRefresh}
      loading={isLoadingBH}
      error={[isErrorBH ? "" : null]}
    >
      <BoardingHouseDetailsRender
        mode="modifiable"
        data={boardinghouse!}
        control={control}
        isEditing={globalIsEditing}
        errors={errors}
        form={{ getValues, setValue, watch }}
        onViewRooms={goToRooms}
        isOccupancySheetOpen={isActionSheetOpen}
        onOpenOccupancySheet={() => setIsActionSheetOpen(true)}
        onCloseOccupancySheet={() => setIsActionSheetOpen(false)}
        onSelectOccupancy={(value) => {
          setValue("occupancyType", value, { shouldDirty: true });
          setIsActionSheetOpen(false);
        }}
      />

      <ReviewSection boardingHouseId={boardinghouse?.id} isOwner={true} />

      <BottomSheetSelector
        options={occupancyTypeOptions}
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        onSelect={(value) => {
          setValue("occupancyType", value, { shouldDirty: true });
          setIsActionSheetOpen(false);
        }}
      />
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
