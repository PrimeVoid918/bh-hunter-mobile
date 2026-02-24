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
  } = useGetOneQuery({ boardingHouseId, roomId });
  const [patchRoom, { isLoading: isPatching }] = usePatchRoomMutation();
  const [deleteRoom, { isLoading: isDelteing }] = useDeleteMutation();

  const {
    control,
    reset,
    getValues,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PatchRoomInput>({
    resolver: zodResolver(PatchRoomInputSchema),
    defaultValues: {
      roomNumber: "",
      description: "",
      maxCapacity: 0,
      price: 0,
      roomType: "SINGLE",
      furnishingType: "UNFURNISHED",
      availabilityStatus: true,
      tags: [],
    },
  });

  // Sync data to form
  useEffect(() => {
    if (room) {
      reset({
        roomNumber: room.roomNumber,
        description: room.description ?? "",
        maxCapacity: room.maxCapacity,
        price: room.price,
        roomType: room.roomType,
        furnishingType: room.furnishingType,
        availabilityStatus: room.availabilityStatus,
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
            You have unsaved changes. Discard and exit edit mode?
          </Text>
        ),
        footer: (
          <>
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
          </>
        ),
      });
    } else {
      setIsEditing(!isEditing);
    }
  };

  const handleDelete = () => {
    ReactNativeHapticFeedback.trigger("impactHeavy");
    showDecision({
      title: (
        <Text variant="titleLarge" style={{ color: theme.colors.error }}>
          Delete Boarding House?
        </Text>
      ),
      body: (
        <Text variant="bodyMedium">
          This action is permanent. All rooms and records associated with "
          {room?.roomNumber}" will be removed.
        </Text>
      ),
      footer: (
        <>
          <PaperButton onPress={hideDecision}>Cancel</PaperButton>
          <PaperButton
            mode="contained"
            buttonColor={theme.colors.error}
            onPress={async () => {
              try {
                await deleteRoom(roomId).unwrap();
                ReactNativeHapticFeedback.trigger("notificationSuccess");
                hideDecision();
                navigation.goBack();
              } catch (err) {
                hideDecision();
                Alert.alert("Error", "Could not delete boarding house.");
              }
            }}
          >
            Delete
          </PaperButton>
        </>
      ),
    });
  };

  const onSaveSubmit = handleSubmit(async (formData) => {
    ReactNativeHapticFeedback.trigger("impactMedium");
    showDecision({
      title: <Text variant="titleLarge">Update Room</Text>,
      body: (
        <Text variant="bodyMedium">
          Apply changes to Room {room?.roomNumber}?
        </Text>
      ),
      footer: (
        <>
          <PaperButton onPress={hideDecision}>Cancel</PaperButton>
          <PaperButton
            mode="contained"
            loading={isPatching}
            onPress={async () => {
              try {
                await patchRoom({
                  boardingHouseId,
                  roomId,
                  data: formData,
                }).unwrap();
                ReactNativeHapticFeedback.trigger("notificationSuccess");
                setIsEditing(false);
                hideDecision();
              } catch (err) {
                hideDecision();
                Alert.alert("Error", "Failed to update room.");
              }
            }}
          >
            Confirm
          </PaperButton>
        </>
      ),
    });
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
        loading={isLoading && isPatching && isDelteing}
        error={[isError ? "Failed to load room" : null]}
      >
        <RoomDetailsRender
          mode="modifiable"
          data={room!}
          control={control}
          isEditing={isEditing}
          errors={errors}
          form={{ getValues, setValue, watch }}
          // Delegation of Sheet Openers
          isRoomTypeSheetOpen
          onOpenRoomTypeSheet={() => setActiveSheet("roomType")}
          isFurnishingTypeSheetOpen
          onOpenFurnishingTypeSheet={() => setActiveSheet("furnishing")}
        />

        {/* Action Selectors */}
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

      {/* Portal FAB Management */}
      <Portal>
        {isFocused && (
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
              // 1. SAVE ACTION (Edit Mode Only)
              ...(isEditing
                ? [
                    {
                      icon: "check",
                      label: "Save Changes",
                      onPress: onSaveSubmit,
                      style: { backgroundColor: theme.colors.primary },
                      color: theme.colors.onPrimary,
                    },
                  ]
                : []),

              // 2. EDIT ACTION (View Mode Only)
              ...(!isEditing
                ? [
                    {
                      icon: "pencil",
                      label: "Edit Details",
                      onPress: handleToggleEdit,
                      style: { backgroundColor: theme.colors.primaryContainer },
                      color: theme.colors.onPrimaryContainer,
                    },
                  ]
                : []),

              // 3. DELETE ACTION (View Mode Only)
              ...(!isEditing
                ? [
                    {
                      icon: "delete",
                      label: "Delete Room",
                      onPress: handleDelete,
                      style: { backgroundColor: theme.colors.errorContainer },
                      color: theme.colors.onErrorContainer,
                    },
                  ]
                : []),

              // 4. CANCEL ACTION (Edit Mode Only)
              ...(isEditing
                ? [
                    {
                      icon: "close",
                      label: "Cancel Edit",
                      onPress: handleToggleEdit,
                    },
                  ]
                : []),
            ]}
            onStateChange={({ open }) => setFabOpen(open)}
            fabStyle={[
              {
                backgroundColor: isEditing
                  ? theme.colors.primary
                  : theme.colors.secondaryContainer,
              },
            ]}
            style={{
              paddingBottom: 80,
            }}
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
