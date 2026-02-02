import { View, Text, StyleSheet, ScrollView, Image, Alert } from "react-native";
import React from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import {
  useGetOneQuery,
  usePatchRoomMutation,
} from "@/infrastructure/room/rooms.redux.api";
import ImageCarousel from "@/components/ui/ImageCarousel";
import {
  BorderRadius,
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
} from "@/constants";

import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import Container from "@/components/layout/Container/Container";
import { OwnerDashboardStackParamList } from "../navigation/dashboard.types";
import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";
import { Ionicons } from "@expo/vector-icons";
import { useEditStateContextSwitcherButtons } from "@/components/ui/Portals/GlobalEditStateContextSwitcherButtonsProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BackendRoomFurnishingType,
  BackendRoomType,
  PatchRoomInput,
  PatchRoomInputSchema,
  RoomFurnishingType,
  roomFurnishingTypeOptions,
  RoomType,
  RoomTypeEnumSchema,
  RoomTypeLabels,
  roomTypeOptions,
} from "../../../../../infrastructure/room/rooms.schema";
import { useDecisionModal } from "@/components/ui/FullScreenDecisionModal";
import {
  Box,
  FormControl,
  Input,
  InputField,
  HStack,
  VStack,
  Button,
} from "@gluestack-ui/themed";

// Form & Validation
import { Controller, useForm } from "react-hook-form";
import AutoExpandingInput from "@/components/ui/AutoExpandingInputComponent";
import { BottomSheetTriggerField } from "../../../../../components/ui/BottomSheet/BottomSheetTriggerField";
import BottomSheetSelector from "@/components/ui/BottomSheet/BottomSheetSelector";
import { BackendFurnishingToFrontend } from "../../../../../infrastructure/room/rooms.schema";
import { FormField } from "@/components/ui/FormFields/FormField";
// import AmenitiesList from "@/components/ui/AmenitiesAndTagsLists/TagListStateful";
import { TagListStateful } from "@/components/ui/AmenitiesAndTagsLists/TagListStateful";
import { ROOM_FEATURE_TAGS } from "@/infrastructure/room/rooms.constants";

export default function RoomsDetailsScreen({ route }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<OwnerDashboardStackParamList>>();

  const { boardingHouseId, roomId } = route.params;

  const isFocused = useIsFocused();
  const { showModal } = useDecisionModal();
  const [isActionSheetRoomTypeOpen, setIsActionSheetRoomTypeOpen] =
    React.useState(false);
  const [isActionSheetFurnishingOpen, setIsActionSheetFurnishingOpen] =
    React.useState(false);

  const {
    showButtons,
    hideButtons,
    isEditing: globalIsEditing,
    setIsEditing: setGlobalIsEditing,
  } = useEditStateContextSwitcherButtons();

  if (!boardingHouseId || !roomId) {
    return <Text>Invalid room or boarding house</Text>;
  }

  const {
    data: roomData,
    isLoading,
    isError,
    refetch,
  } = useGetOneQuery({ boardingHouseId, roomId });

  const [patchRoom] = usePatchRoomMutation();

  const {
    control,
    reset,
    getValues,
    setValue,
    formState: { errors },
    watch,
  } = useForm<PatchRoomInput>({
    resolver: zodResolver(PatchRoomInputSchema),
    defaultValues: {
      roomNumber: "",
      description: "",
      maxCapacity: "",
      price: "",
      roomType: "SINGLE",
      furnishingType: "UNFURNISHED",
      availabilityStatus: false,
      tags: [],
    },
  });

  React.useEffect(() => {
    if (roomData) {
      reset({
        roomNumber: roomData.roomNumber,
        description: roomData.description ?? "",
        maxCapacity: roomData.maxCapacity,
        price: roomData.price,
        roomType: roomData.roomType,
        furnishingType: roomData.furnishingType,
        tags: roomData.tags ?? [],
      });
    }
  }, [roomData, reset]);

  const selectedAmenities = watch("tags") ?? [];
  React.useEffect(() => {
    if (!isFocused) {
      hideButtons();
      return;
    }

    showButtons({
      onEdit: () => setGlobalIsEditing(true),

      onSave: () => {
        showModal({
          title: "Save Changes?",
          message: "This will update the room details.",
          cancelText: "Cancel",
          confirmText: "Save",
          onConfirm: async () => {
            try {
              const payload = getValues();
              await patchRoom({
                boardingHouseId,
                roomId,
                data: payload,
              }).unwrap();
              Alert.alert("Success", "Room updated");
              setGlobalIsEditing(false);
            } catch (err: any) {
              // err is a serialized RTK Query error
              console.error("PATCH failed:", err);

              let message = "Unknown error";
              if (err?.data) {
                // Backend sent error body
                message = JSON.stringify(err.data, null, 2);
              } else if (err?.error) {
                // Fetch-level error
                message = err.error;
              }

              Alert.alert("Failed to update", message);
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
            setGlobalIsEditing(false);
          },
        });
      },
    });

    return () => hideButtons();
  }, [isFocused, showButtons, hideButtons, showModal, getValues]);

  if (isLoading || !roomData) return <FullScreenLoaderAnimated />;
  if (isError) return <FullScreenErrorModal />;

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer, s.container]}
      contentContainerStyle={GlobalStyle.GlobalsContentContainer}
    >
      <Container>
        <VStack>
          {/* Header */}
          <View style={s.header}>
            <View style={s.header_titleBackdrop}></View>
            <FormField
              name="roomNumber"
              control={control}
              isEditing={globalIsEditing}
              inputConfig={{
                inputType: "singleLine",
                placeholder: "Room number",
                inputStyle: s.header_titleText,
                inputContainerStyle: s.inputContainerStyle,
              }}
              containerStyle={s.header_title}
              textStyle={s.header_titleText}
            />

            <PressableImageFullscreen
              image={roomData.thumbnail?.[0]}
              containerStyle={{ width: "100%", aspectRatio: 2 }}
              imageStyleConfig={{
                resizeMode: "cover",
                containerStyle: { borderRadius: BorderRadius.md },
              }}
            />
          </View>

          {/* Body */}
          <VStack style={{ paddingVertical: Spacing.md }}>
            <FormField
              name="description"
              control={control}
              isEditing={globalIsEditing}
              inputConfig={{
                inputType: "paragraph",
                placeholder: "Room description",
                inputStyle: { fontSize: 16 },
                inputContainerStyle: s.inputContainerStyle,
              }}
            />

            {/* Price & Capacity */}
            <VStack>
              <FormField
                name="price"
                control={control}
                isEditing={globalIsEditing}
                inputConfig={{
                  inputType: "singleLine",
                  placeholder: "Price",
                  inputContainerStyle: s.inputContainerStyle,
                }}
                textAffix={{ textPrefix: "₱ " }}
              />

              <FormField
                name="maxCapacity"
                control={control}
                isEditing={globalIsEditing}
                inputConfig={{
                  inputType: "singleLine",
                  placeholder: "Max Capacity",
                  inputContainerStyle: s.inputContainerStyle,
                }}
              />
            </VStack>

            {/* Room Type */}
            <BottomSheetTriggerField
              name="roomType"
              control={control}
              label="Room Type"
              options={roomTypeOptions}
              isEditing={globalIsEditing}
              placeholder="Select Furnishing Type"
              error={errors.furnishingType?.message}
              onOpen={() => setIsActionSheetRoomTypeOpen(true)}
            />

            {/* Furnishing */}
            <BottomSheetTriggerField
              name="furnishingType"
              control={control}
              label="Furnishing Type"
              options={roomFurnishingTypeOptions}
              isEditing={globalIsEditing}
              placeholder="Select Furnishing Type"
              error={errors.furnishingType?.message}
              onOpen={() => setIsActionSheetFurnishingOpen(true)}
            />

            <ImageCarousel
              images={roomData.gallery ?? []}
              variant="secondary"
            />
          </VStack>

          <VStack style={s.tagsContainer}>
            <Text style={s.sectionTitle}>Amenities: </Text>
            <TagListStateful
              name="tags"
              items={ROOM_FEATURE_TAGS}
              isEditing={globalIsEditing}
              form={{ getValues, setValue, watch }}
            />
          </VStack>
        </VStack>

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
      </Container>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md, gap: Spacing.md },
  header: { gap: Spacing.md, position: "relative", overflow: "hidden" },
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
    elevation: 10, // Android
  },
  header_title: {
    position: "absolute",
    top: "65%",
    width: "100%",
    paddingLeft: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    left: 0,
    borderColor: "green",
    zIndex: 2000,
    elevation: 2000, // Android
  },
  header_titleText: {
    fontSize: Fontsize.h1,
    fontWeight: "900",
    color: Colors.TextInverse[2],
  },
  body: { gap: Spacing.xl },

  boxStyle: {
    marginTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 5,
    overflow: "hidden",
    borderBottomRightRadius: BorderRadius.md,
  },

  debug_border: {
    borderWidth: 2,
  },

  textColor: {
    color: Colors.TextInverse[1],
  },
  text_title: {
    fontSize: Fontsize.h1,
    fontWeight: "900",
    color: Colors.TextInverse[2],
  },
  text_subTitle: {
    fontSize: Fontsize.h3,
    fontWeight: "900",
    color: Colors.TextInverse[2],
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
  tagsContainer: {
    backgroundColor: Colors.PrimaryLight[7],
    padding: 16,
    borderRadius: BorderRadius.md,
  },
  tagsChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.PrimaryLight[6],
    borderRadius: BorderRadius.md,
  },
  tagsChipSelected: {
    backgroundColor: "#10b981",
  },
  tagsText: {
    color: Colors.TextInverse[1],
    fontSize: Fontsize.sm,
  },
  tagsTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  tagsDisplay: {
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
  inputContainerStyle: {
    borderWidth: 3,
    borderColor: "green",
    borderRadius: BorderRadius.md,
  },
});
