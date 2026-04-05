import React, { useEffect, useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";
import {
  FAB,
  Portal,
  useTheme,
  Text,
  Button as PaperButton,
} from "react-native-paper";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Components & Logic
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import RoomDetailsRender from "@/features/shared/rooms/RoomDetailsRender";
import BottomSheetSelector from "@/components/ui/BottomSheet/BottomSheetSelector";
import { useDecisionModal } from "@/components/ui/Modals/DecisionModalWrapper";

// Infrastructure
import {
  useDeleteMutation,
  useGetOneQuery,
  usePatchRoomMutation,
  // useDeleteRoomMutation // Ensure this is in your API
} from "@/infrastructure/room/rooms.redux.api";
import {
  PatchRoomInput,
  PatchRoomInputSchema,
  roomTypeOptions,
  roomFurnishingTypeOptions,
} from "@/infrastructure/room/rooms.schema";
import { BorderRadius, Colors, Fontsize, Spacing } from "@/constants";

export default function RoomsDetailsScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { showDecision, hideDecision } = useDecisionModal();

  const { boardingHouseId, roomId } = route.params;

  // UI Local States
  const [fabOpen, setFabOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSheet, setActiveSheet] = useState<
    "roomType" | "furnishing" | null
  >(null);

  // API Hooks
  const {
    data: room,
    isLoading,
    isError,
    refetch,
  } = useGetOneQuery({ boardingHouseId, roomId }, { skip: !roomId }); // Skip if no ID

  const [patchRoom, { isLoading: isPatching }] = usePatchRoomMutation();
  const [deleteRoom] = useDeleteMutation();

  const {
    control,
    reset,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PatchRoomInput>({
    resolver: zodResolver(PatchRoomInputSchema),
    defaultValues: {
      roomNumber: "",
      description: "",
      maxCapacity: 1,
      price: 0,
      roomType: "SINGLE",
      furnishingType: "UNFURNISHED",
      availabilityStatus: true,
      tags: [],
    },
  });

  // SYNC DATA: Only reset when room data actually exists
  useEffect(() => {
    if (room) {
      reset({
        roomNumber: room.roomNumber || "",
        description: room.description ?? "",
        maxCapacity: room.maxCapacity ?? 1,
        price: room.price ?? 0,
        roomType: room.roomType ?? "SINGLE",
        furnishingType: room.furnishingType ?? "UNFURNISHED",
        availabilityStatus: room.availabilityStatus ?? true,
        tags: room.tags ?? [],
      });
    }
  }, [room, reset]);

  // --- Handlers ---
  const handleToggleEdit = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    if (isEditing && isDirty) {
      showDecision({
        title: <Text variant="titleLarge">Discard Changes?</Text>,
        body: (
          <Text variant="bodyMedium">
            You have unsaved changes. Discard and exit?
          </Text>
        ),
        footer: (
          <View style={{ flexDirection: "row", gap: 8 }}>
            <PaperButton onPress={hideDecision}>Stay</PaperButton>
            <PaperButton
              mode="contained"
              buttonColor={theme.colors.error}
              onPress={() => {
                setIsEditing(false);
                reset();
                hideDecision();
              }}
            >
              Discard
            </PaperButton>
          </View>
        ),
      });
    } else {
      setIsEditing(!isEditing);
    }
  };

  const onSaveSubmit = handleSubmit(async (formData) => {
    ReactNativeHapticFeedback.trigger("impactMedium");
    try {
      await patchRoom({ boardingHouseId, roomId, data: formData }).unwrap();
      ReactNativeHapticFeedback.trigger("notificationSuccess");
      setIsEditing(false);
      hideDecision();
    } catch (err) {
      Alert.alert("Error", "Failed to update room.");
    }
  });

  const onRefresh = () => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  };

  return (
    <View style={{ flex: 1 }}>
      <StaticScreenWrapper
        variant="list"
        refreshing={refreshing}
        onRefresh={onRefresh}
        loading={isLoading} // Simplified loading
        error={[isError ? "Failed to load room" : null]}
      >
        {/* CRITICAL FIX: Only render if room exists */}
        {room ? (
          <RoomDetailsRender
            mode="modifiable"
            data={room}
            control={control}
            isEditing={isEditing}
            errors={errors}
            form={{ setValue, watch }}
            onOpenRoomTypeSheet={() => setActiveSheet("roomType")}
            onOpenFurnishingTypeSheet={() => setActiveSheet("furnishing")}
          />
        ) : null}

        <BottomSheetSelector
          options={roomTypeOptions}
          isOpen={activeSheet === "roomType"}
          onClose={() => setActiveSheet(null)}
          onSelect={(value) => {
            setValue("roomType", value, { shouldDirty: true });
            setActiveSheet(null);
          }}
        />
        <BottomSheetSelector
          options={roomFurnishingTypeOptions}
          isOpen={activeSheet === "furnishing"}
          onClose={() => setActiveSheet(null)}
          onSelect={(value) => {
            setValue("furnishingType", value, { shouldDirty: true });
            setActiveSheet(null);
          }}
        />
      </StaticScreenWrapper>

      <Portal>
        {isFocused && room && (
          <FAB.Group
            open={fabOpen}
            visible={isFocused}
            icon={
              fabOpen
                ? "chevron-down"
                : isEditing
                  ? "content-save"
                  : "dots-vertical"
            }
            actions={[
              ...(isEditing
                ? [{ icon: "check", label: "Save", onPress: onSaveSubmit }]
                : []),
              ...(!isEditing
                ? [{ icon: "pencil", label: "Edit", onPress: handleToggleEdit }]
                : []),
              ...(!isEditing
                ? [{ icon: "delete", label: "Delete", onPress: () => {} }]
                : []), // Wire up delete here
              ...(isEditing
                ? [
                    {
                      icon: "close",
                      label: "Cancel",
                      onPress: handleToggleEdit,
                    },
                  ]
                : []),
            ]}
            onStateChange={({ open }) => setFabOpen(open)}
            style={{ paddingBottom: 80 }}
          />
        )}
      </Portal>
    </View>
  );
}

const s = StyleSheet.create({
  fabStack: {
    position: "absolute",
    right: 16,
    bottom: 90,
    alignItems: "center",
    gap: 12, // Space between Delete and Edit FABs
  },
  fab: {
    borderRadius: 16, // MD3 xl-style
    elevation: 4,
    // Removed borderWidth/borderColor to match M3 FAB flat style
  },
});
