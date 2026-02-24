import React, { useEffect, useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import {
  RouteProp,
  useRoute,
  useNavigation,
  useIsFocused,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  FAB,
  Portal,
  useTheme,
  Text,
  Button as PaperButton,
} from "react-native-paper";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

// Hooks & System
import { useDecisionModal } from "@/components/ui/Modals/DecisionModalWrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// UI Components
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import BoardingHouseDetailsRender from "../../../shared/boarding-house/BoardingHouseDetailsRender";
import ReviewSection from "@/components/ui/Reviews/ReviewSection";
import BottomSheetSelector from "@/components/ui/BottomSheet/BottomSheetSelector";

// Infrastructure
import {
  PatchBoardingHouseSchema,
  type PatchBoardingHouseInput,
  occupancyTypeOptions,
} from "@/infrastructure/boarding-houses/boarding-house.schema";
import {
  useDeleteMutation,
  useGetOneQuery as useGetOneBoardingHouses,
  usePatchMutation,
} from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import { OwnerDashboardStackParamList } from "../dashboard/navigation/dashboard.types";
import { Spacing, Fontsize, BorderRadius } from "@/constants";

type RouteProps = RouteProp<
  OwnerDashboardStackParamList,
  "BoardingHouseDetailsScreen"
>;

export default function BoardingHouseDetailsScreen() {
  const theme = useTheme();
  const route = useRoute<RouteProps>();
  const { id: bhId } = route.params;
  const navigation =
    useNavigation<NativeStackNavigationProp<OwnerDashboardStackParamList>>();
  const isFocused = useIsFocused();
  const { showDecision, hideDecision } = useDecisionModal();
  const [fabOpen, setFabOpen] = useState(false);

  // ── States ──
  const [refreshing, setRefreshing] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ── RTK Query ──
  const {
    data: boardinghouse,
    isLoading: isLoadingBH,
    isError: isErrorBH,
    refetch,
  } = useGetOneBoardingHouses(bhId);
  const [patchBoardingHouse, { isLoading: isPatching }] = usePatchMutation();
  const [deleteBoardingHouse, { isLoading: isDeleting }] = useDeleteMutation();

  const {
    control,
    reset,
    getValues,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isDirty },
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

  // Sync form when data arrives
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

  // ── Handlers ──
  const handleToggleEdit = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    if (isEditing && isDirty) {
      // Prompt to discard changes if dirty
      showDecision({
        title: <Text variant="titleLarge">Discard Changes?</Text>,
        body: (
          <Text variant="bodyMedium">
            You have unsaved modifications. Discard them and exit edit mode?
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
          {boardinghouse?.name}" will be removed.
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
                await deleteBoardingHouse(bhId!).unwrap();
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
      title: <Text variant="titleLarge">Save Changes</Text>,
      body: (
        <Text variant="bodyMedium">
          Update boarding house details with the new information?
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
                await patchBoardingHouse({
                  id: bhId!,
                  data: formData,
                }).unwrap();
                ReactNativeHapticFeedback.trigger("notificationSuccess");
                setIsEditing(false);
                hideDecision();
              } catch (err) {
                hideDecision();
                Alert.alert(
                  "Update Failed",
                  "Could not save changes. Please try again.",
                );
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
    refetch?.().finally(() => setRefreshing(false));
  };

  return (
    <View style={{ flex: 1 }}>
      <StaticScreenWrapper
        variant="list"
        refreshing={refreshing}
        onRefresh={onRefresh}
        loading={isLoadingBH}
        error={[isErrorBH ? "Failed to load" : null]}
      >
        <BoardingHouseDetailsRender
          mode="modifiable"
          data={boardinghouse!}
          control={control}
          isEditing={isEditing}
          errors={errors}
          form={{ getValues, setValue, watch }}
          onViewRooms={() =>
            navigation.navigate("RoomsListMainScreen", { paramsId: bhId! })
          }
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

      {/* FAB Floating above Tab Bar */}
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
            onPress={() => {
              if (fabOpen) {
                // do something if the speed dial is open
              }
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
