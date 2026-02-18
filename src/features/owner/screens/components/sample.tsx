import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState, useMemo } from "react";
import {
  Colors,
  Spacing,
  GlobalStyle,
  Fontsize,
  BorderRadius,
} from "@/constants";
import { Box, FormControl, Input, InputField } from "@gluestack-ui/themed";
import { useNavigation, useIsFocused } from "@react-navigation/native";

// ui components
import ImageCarousel from "@/components/ui/ImageCarousel";
import Button from "@/components/ui/Button";

// layout
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

// redux
import { HStack, VStack } from "@gluestack-ui/themed";

import {
  useGetOneQuery as useGetOneBoardingHouses,
  usePatchMutation,
} from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";
import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";
import Container from "@/components/layout/Container/Container";
import { Controller, useForm } from "react-hook-form";
import { PatchBoardingHouseInput } from "@/infrastructure/boarding-houses/boarding-house.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatchBoardingHouseSchema } from "../../../../infrastructure/boarding-houses/boarding-house.schema";
import {
  AMENITIES,
  Amenity,
} from "@/infrastructure/boarding-houses/boarding-house.constants";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import AutoExpandingInput from "@/components/ui/AutoExpandingInputComponent";
import { useEditStateContextSwitcherButtons } from "@/components/ui/Portals/GlobalEditStateContextSwitcherButtonsProvider";
import { useDecisionModal } from "@/components/ui/FullScreenDecisionModal";

export default function BoardingHouseDetailsScreen({ bhID }: { bhID: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { showButtons, hideButtons } = useEditStateContextSwitcherButtons();

  const { showModal } = useDecisionModal();

  const { selectedUser: data } = useDynamicUserApi();
  const user = data;

  const navigation = useNavigation<any>(); // adjust type if you have a typed navigator

  // ──────────────────────────────────────
  // 1. All hooks – unconditional
  // ──────────────────────────────────────
  const {
    data: boardinghouse,
    isLoading: isBoardingHouseLoading,
    isError: isBoardingHouseError,
    refetch: refetchBoardingHouse,
  } = useGetOneBoardingHouses(bhID);

  const [
    patchBoardingHouse,
    { isLoading: isPatchLoading, isError: isPatchError },
  ] = usePatchMutation();

  // ---- defaultValues (memoised) ----
  const initialDefaultValues = useMemo<Partial<PatchBoardingHouseInput>>(() => {
    if (!boardinghouse) return {};
    return {
      name: boardinghouse.name,
      address: boardinghouse.address,
      description: boardinghouse.description,
      availabilityStatus: boardinghouse.availabilityStatus,
      amenities: boardinghouse.amenities,
    };
  }, [boardinghouse]);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<PatchBoardingHouseInput>({
    resolver: zodResolver(PatchBoardingHouseSchema) as any,
    defaultValues: initialDefaultValues,
  });

  const currentValues = watch(); // watch entire form

  const hasChanges = useMemo(() => {
    // simple shallow comparison, you can make it deep if needed
    return (
      JSON.stringify(currentValues) !== JSON.stringify(initialDefaultValues)
    );
  }, [currentValues, initialDefaultValues]);

  React.useEffect(() => {
    if (boardinghouse) {
      reset({
        name: boardinghouse.name,
        address: boardinghouse.address,
        description: boardinghouse.description,
        availabilityStatus: boardinghouse.availabilityStatus,
        amenities: boardinghouse.amenities,
      });
    }
  }, [boardinghouse, reset]);

  const selectedAmenities = watch("amenities") ?? [];

  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (isFocused) {
      showButtons({
        onEdit: () => setIsEditing(true),
        onSave: () => {
          showModal({
            title: "Save Changes?",
            message:
              "You are about to save changes to this listing. Once saved, the updated information will be visible to all users. Are you sure you want to continue?",
            cancelText: "Cancel",
            confirmText: "Save",
            onConfirm: async () => {
              try {
                console.log("user data:", user);
                if (!user?.id) return Alert.alert("Owner Id cant be fetched!");
                if (!bhID) return Alert.alert("BH ID cant be fetched!");
                console.log(boardinghouse?.id!);
                const res = await patchBoardingHouse({
                  id: bhID,
                  data: {
                    name: currentValues.name,
                    address: currentValues.address,
                    description: currentValues.description,
                    availabilityStatus: currentValues.availabilityStatus,
                    amenities: currentValues.amenities,
                    occupancyType: currentValues.occupancyType,
                  },
                }).unwrap();
                console.log("path res:", res);
              } catch (e) {}
              Alert.alert("Changes saved successfully!");
              // Here you could also call your patch API
              setIsEditing(false);
            },
          });
        },
        onDiscard: () => {
          // ! watching the changes does not work
          if (hasChanges) {
            showModal({
              title: "Discard Changes?",
              cancelText: "Cancel",
              confirmText: "Discard",
              message:
                "You have unsaved changes. Discarding will lose all edits made to this listing. Are you sure you want to continue?",
              onConfirm: () => {
                setIsEditing(false);
                // optionally reset form to initial values
                reset(initialDefaultValues);
              },
            });
          } else {
            setIsEditing(false);
          }
        },
      });
    }

    return () => {
      hideButtons(); // will run on unmount
    };
  }, [isFocused]);

  // ---- derived available amenities (no state, no useEffect) ----
  const availableAmenities = useMemo(() => {
    return AMENITIES.filter((a) => !selectedAmenities.includes(a));
  }, [selectedAmenities]);

  // ──────────────────────────────────────
  // 2. Handlers
  // ──────────────────────────────────────
  const handleSelectAmenity = (item: string) => {
    const update = [...selectedAmenities, item] as Amenity[];
    setValue("amenities", update);
  };

  const handleRemoveAmenity = (item: string) => {
    const update = selectedAmenities.filter((a) => a !== item);
    setValue("amenities", update as Amenity[]);
  };

  const onSubmitForm = (data: PatchBoardingHouseInput) => {
    // await patchBoardingHouse({ id: bhID, data }).unwrap();
    // setIsEditing(false);
    // refetchBoardingHouse();
  };

  const handleGotoRoomLists = (bhNumber: number) => {
    if (!bhNumber) return;
    navigation.navigate("RoomsBookingListsScreen", { paramsId: bhNumber });
  };

  const handRefetchBoardingHouse = () => {
    setRefreshing(true);
    refetchBoardingHouse();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // ──────────────────────────────────────
  // 3. Early returns (AFTER all hooks)
  // ──────────────────────────────────────
  if (isBoardingHouseLoading || !boardinghouse) {
    return <FullScreenLoaderAnimated />;
  }

  if (isBoardingHouseError) {
    return <FullScreenErrorModal />;
  }

  // ──────────────────────────────────────
  // 4. Render UI
  // ──────────────────────────────────────
  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
      wrapInScrollView={false}
    >
      <Container refreshing={refreshing} onRefresh={handRefetchBoardingHouse}>
        <VStack style={[GlobalStyle.GlobalsContainer, s.main_container]}>
          {/* ── Header ── */}
          <View style={s.header}>
            <PressableImageFullscreen
              image={boardinghouse?.thumbnail?.[0]}
              containerStyle={{ width: "100%", aspectRatio: 1 }}
              imageStyleConfig={{
                resizeMode: "cover",
                containerStyle: {
                  margin: "auto",
                  borderRadius: BorderRadius.md,
                },
              }}
            />

            <HStack>
              <Text style={s.text_generic_small}>*****</Text>
              <Text style={s.text_generic_small}>( 4.0 )</Text>
            </HStack>

            <HStack style={{ alignItems: "center", gap: 10 }}>
              <VStack style={{ width: "75%", gap: 10 }}>
                {/* Name */}
                <FormControl isInvalid={!!errors.name}>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) =>
                      isEditing ? (
                        <Input borderColor="$green">
                          <InputField
                            placeholder={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            style={[s.text_title, { fontWeight: "bold" }]}
                          />
                        </Input>
                      ) : (
                        <Text style={s.text_title}>{boardinghouse.name}</Text>
                      )
                    }
                  />
                  {errors.name && (
                    <Text style={{ color: "red" }}>{errors.name.message}</Text>
                  )}
                </FormControl>

                {/* Address */}
                <FormControl isInvalid={!!errors.address}>
                  <Controller
                    control={control}
                    name="address"
                    render={({ field: { onChange, onBlur, value } }) =>
                      isEditing ? (
                        <Input borderColor="$green">
                          <InputField
                            placeholder="Enter address"
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
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
                    <Text style={{ color: "red" }}>
                      {errors.address.message}
                    </Text>
                  )}
                </FormControl>
              </VStack>

              <Button
                containerStyle={{ marginTop: 10, padding: 10 }}
                onPressAction={() => handleGotoRoomLists(boardinghouse.id)}
              >
                <Text>View Rooms</Text>
              </Button>
            </HStack>
          </View>

          {/* ── Body ── */}
          <VStack style={s.body}>
            <ImageCarousel
              variant="secondary"
              images={boardinghouse?.gallery ?? []}
            />

            {/* Description */}
            <FormControl>
              <Controller
                control={control}
                name="description"
                rules={{
                  maxLength: {
                    value: 500,
                    message: "Description must be 500 characters or less",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) =>
                  isEditing ? (
                    <AutoExpandingInput
                      placeholder="Enter Description of your property"
                      style={s.text_description}
                      containerStyle={{
                        padding: 10,
                        borderColor: "green",
                        borderWidth: 2,
                        borderRadius: BorderRadius.md,
                      }}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                  ) : (
                    <Text style={s.text_description}>
                      {boardinghouse.description}
                    </Text>
                  )
                }
              />
            </FormControl>

            {/* Amenities */}
            <VStack
              style={{
                padding: 10,
                borderRadius: BorderRadius.md,
              }}
            >
              <Text style={s.text_generic_large}>Additional Information:</Text>

              {isEditing ? (
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
                  {availableAmenities.map((item, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => handleSelectAmenity(item)}
                    >
                      <Box
                        style={{
                          borderRadius: BorderRadius.md,
                          padding: 5,
                        }}
                      >
                        <Text style={s.generic_text}>{item}</Text>
                      </Box>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <VStack style={{ gap: 5, marginTop: 5 }}>
                  {boardinghouse?.amenities?.map((key, idx) => (
                    <Text
                      key={idx}
                      style={[
                        s.text_generic_medium,
                        {
                          padding: 5,
                          borderRadius: BorderRadius.md,
                        },
                      ]}
                    >
                      {key.replace(/([a-z])([A-Z])/g, "$1 $2")}
                    </Text>
                  ))}
                </VStack>
              )}
            </VStack>
          </VStack>
        </VStack>
      </Container>
    </StaticScreenWrapper>
  );
}

// ──────────────────────────────────────
// Styles
// ──────────────────────────────────────
const s = StyleSheet.create({
  main_container: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  header: {
    minHeight: 250,
    width: "100%",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    zIndex: 5,
    marginBottom: 10,
    gap: 10,
  },
  body: { gap: Spacing.md },

  text_title: {
    color: Colors.TextInverse[1],
    fontSize: Fontsize.xxl,
    fontWeight: "900",
  },
  text_description: {
    fontSize: Fontsize.lg,
    color: Colors.TextInverse[2],
  },
  text_address: {
    fontSize: Fontsize.sm,
    paddingTop: 5,
    color: Colors.TextInverse[2],
  },
  text_generic_small: {
    fontSize: Fontsize.sm,
    color: Colors.TextInverse[1],
  },
  text_generic_medium: {
    fontSize: Fontsize.md,
    color: Colors.TextInverse[1],
  },
  text_generic_large: {
    fontSize: Fontsize.lg,
    color: Colors.TextInverse[1],
  },
  generic_text: {},
});
