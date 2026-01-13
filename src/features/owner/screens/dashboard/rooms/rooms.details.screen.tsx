import { View, Text, StyleSheet, ScrollView, Image, Alert } from "react-native";
import React from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import { Box, Button, HStack, VStack } from "@gluestack-ui/themed";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PatchRoomInput,
  PatchRoomInputSchema,
} from "../../../../../infrastructure/room/rooms.schema";
import { useDecisionModal } from "@/components/ui/FullScreenDecisionModal";

export default function RoomsDetailsScreen({ route }) {
  const navigate =
    useNavigation<NativeStackNavigationProp<OwnerDashboardStackParamList>>();

  const { boardingHouseId, roomId } = route.params;

  const [refreshing, setRefreshing] = React.useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = React.useState(false);
  const isFocused = useIsFocused();
  const { showModal } = useDecisionModal();

  const {
    showButtons,
    hideButtons,
    isEditing: globalIsEditing,
    setIsEditing: setGlobalIsEditing,
  } = useEditStateContextSwitcherButtons();

  if (!boardingHouseId || !roomId) {
    return <Text>Invalid room or boarding house</Text>;
  }

  //!
  const {
    data: roomData,
    isLoading: isRoomDataLoading,
    isError: isRoomDataError,
    error: roomDataError,
  } = useGetOneQuery({ boardingHouseId, roomId });

  const [patchRoom, {}] = usePatchRoomMutation();

  if (isRoomDataError) {
    console.log("Room data error:", roomDataError);
  }

  //* form set up
  const {
    control,
    reset,
    getValues,
    setValue,
    watch,
    formState: { dirtyFields, errors },
  } = useForm<PatchRoomInput>({
    resolver: zodResolver(PatchRoomInputSchema),
    defaultValues: {
      roomNumber: "",
      description: "",
      maxCapacity: "",
      price: "",
      roomType: "SINGLE",
      furnishingType: "UNFURNISHED",
      tags: [],
    },
  });

  React.useEffect(() => {
    if (roomData) {
      reset({
        roomNumber: roomData.roomNumber,
        description: roomData.description,
        maxCapacity: roomData.maxCapacity,
        price: roomData.price,
        roomType: roomData.roomType,
        furnishingType: roomData.furnishingType,
        tags: roomData.tags,
      });
    }
  }, [roomData, reset]);

  const selectedTags = watch("tags") ?? [];

  React.useEffect(() => {
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
              await patchRoom({
                roomId: roomId,
                boardingHouseId: boardingHouseId,
                data: payload,
              }).unwrap();
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
  }, [
    isFocused,
    showButtons,
    hideButtons,
    showModal,
    getValues,
    reset,
    patchRoom,
    roomId,
  ]);

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer, s.container]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
    >
      {isRoomDataLoading && <FullScreenLoaderAnimated />}
      {isRoomDataError && <FullScreenErrorModal />}
      <Container>
        {roomData && (
          <VStack>
            <View style={s.header}>
              <PressableImageFullscreen
                image={roomData.thumbnail?.[0]}
                containerStyle={{ width: "100%", aspectRatio: 1.2 }}
                imageStyleConfig={{
                  resizeMode: "cover",
                  containerStyle: { borderRadius: BorderRadius.md },
                }}
              />
            </View>

            <VStack
              style={[{ paddingTop: Spacing.md, paddingBottom: Spacing.md }]}
            >
              <HStack style={[s.boxStyle]}>
                <VStack>
                  <Text style={[s.text_title]}>{roomData.roomNumber}</Text>
                  <Text style={[s.textColor]}>
                    Room Type: {roomData.roomType}
                  </Text>
                  <Text style={[s.textColor]}>
                    Furnishing: {roomData.furnishingType}
                  </Text>
                </VStack>

                <VStack
                  style={[{ marginLeft: "auto", alignItems: "flex-end" }]}
                >
                  <Box
                    style={[
                      {
                        alignItems: "flex-end",
                        paddingLeft: Spacing.md,
                        paddingRight: Spacing.md,
                      },
                    ]}
                  >
                    <Text style={[s.textColor]}>₱{roomData.price}</Text>
                    <HStack style={[{ gap: Spacing.sm }]}>
                      <Ionicons
                        name="people-outline"
                        size={Spacing.lg}
                        color={s.textColor.color}
                      />
                      <Text style={[s.textColor]}>
                        {roomData.maxCapacity} / {roomData.currentCapacity}
                      </Text>
                    </HStack>
                  </Box>
                  <Button>
                    <Text>Book Now</Text>
                  </Button>
                </VStack>
              </HStack>

              <HStack>
                <Text style={[s.textColor]}>{roomData.availabilityStatus}</Text>
              </HStack>
              <HStack>
                <Text style={[s.textColor]}>{roomData.description}</Text>
              </HStack>
            </VStack>

            <ImageCarousel
              images={roomData.gallery ?? []}
              variant="secondary"
            />

            {/* Tags */}
            {/*! refactorable into a component for multiple selection of ameneties */}
            {/*! refactorable into a component for multiple selection of ameneties */}

            <Box>
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
                {(roomData.tags ?? []).map((item, index) => (
                  <Box
                    key={index}
                    style={{
                      borderRadius: BorderRadius.md,
                      padding: 5,
                      backgroundColor: Colors.PrimaryLight[6],
                    }}
                  >
                    <Text style={[s.textColor]}>{item}</Text>
                  </Box>
                ))}
              </ScrollView>
            </Box>
          </VStack>
        )}
      </Container>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md, gap: Spacing.md },
  header: { gap: Spacing.md },
  body: { gap: Spacing.xl },

  boxStyle: {
    marginTop: Spacing.md,
    // borderWidth: 2,
    // paddingLeft: Spacing.lg,
    // paddingRight: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 5,
    overflow: "hidden",
    // borderRadius: BorderRadius.md,
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
});
