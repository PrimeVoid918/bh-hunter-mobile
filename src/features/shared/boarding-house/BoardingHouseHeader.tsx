import { StyleSheet, View } from "react-native";
import React from "react";
import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";
import { BorderRadius, Fontsize, Spacing } from "@/constants";
import {
  FindOneBoardingHouse,
  OccupancyType,
  occupancyTypeOptions,
  PatchBoardingHouseInput,
} from "@/infrastructure/boarding-houses/boarding-house.schema";
import { FormField } from "@/components/ui/FormFields/FormField";
import { HStack, VStack } from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetTriggerField } from "@/components/ui/BottomSheet/BottomSheetTriggerField";
import { Button, Chip, Text, useTheme } from "react-native-paper";
import {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

interface BoardingHouseHeaderInterface {
  mode: "modifiable";
  data: FindOneBoardingHouse;
  control: Control<PatchBoardingHouseInput>;
  errors: FieldErrors<PatchBoardingHouseInput>;
  form: {
    getValues: UseFormGetValues<PatchBoardingHouseInput>;
    setValue: UseFormSetValue<PatchBoardingHouseInput>;
    watch: UseFormWatch<PatchBoardingHouseInput>;
  };
  isEditing: boolean;
  onViewRooms: () => void;
  isOccupancySheetOpen: boolean;
  onOpenOccupancySheet: () => void;
  onCloseOccupancySheet: () => void;
  onSelectOccupancy: (value: OccupancyType) => void;
}

export function BoardingHouseHeaderEdit({
  data,
  control,
  isEditing,
  errors,
  form,
  onViewRooms,
  isOccupancySheetOpen,
  onOpenOccupancySheet,
  onCloseOccupancySheet,
  onSelectOccupancy,
}: BoardingHouseHeaderInterface) {
  const { colors } = useTheme();
  return (
    <View style={s.header}>
      <View style={s.header}>
        <PressableImageFullscreen
          image={data.thumbnail?.[0]}
          containerStyle={{ width: "100%", aspectRatio: 2 }}
          imageStyleConfig={{
            resizeMode: "cover",
            containerStyle: { borderRadius: BorderRadius.md },
          }}
        />
      </View>

      <HStack style={{ marginTop: 16, alignItems: "flex-start", gap: 12 }}>
        <VStack style={{ flex: 1, gap: 12 }}>
          {/* Title */}
          <HStack>
            <FormField
              name="name"
              control={control}
              isEditing={isEditing}
              textStyle={{ fontSize: Fontsize.h1, fontWeight: "900" }}
            />
          </HStack>

          {/* Address */}
          <VStack>
            <HStack
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: Fontsize.md }}>Address: </Text>
              <FormField
                name="address"
                control={control}
                isEditing={isEditing}
                containerStyle={
                  {
                    // borderWidth: 2,
                  }
                }
              />
            </HStack>
            <HStack>
              <Ionicons name="location-outline" size={20} color="black" />
              <HStack gap={Spacing.md}>
                <Text>{data.location.coordinates[0].toFixed(4)}</Text>
                <Text>{data.location.coordinates[1].toFixed(4)}</Text>
              </HStack>
            </HStack>
          </VStack>

          {/* OccupancyType */}
          {/* <Text>Tenant Type</Text> */}
          <BottomSheetTriggerField
            name="occupancyType"
            control={control}
            label="Tenant Type"
            options={occupancyTypeOptions}
            isEditing={isEditing}
            placeholder="Select Occupancy Type"
            error={errors.occupancyType?.message}
            onOpen={onOpenOccupancySheet}
          />
        </VStack>

        <Button onPress={onViewRooms} mode="contained">
          View Rooms
        </Button>
      </HStack>
    </View>
  );
}

interface BoaBoardingHouseHeaderViewInterface {
  data: FindOneBoardingHouse;
  onViewRooms: () => void;
}
export function BoaBoardingHouseHeaderView({
  data,
  onViewRooms,
}: BoaBoardingHouseHeaderViewInterface) {
  const { colors } = useTheme();

  const selected = occupancyTypeOptions.find(
    (o) => o.value === data.occupancyType,
  );

  return (
    <View style={s.header}>
      <View style={s.header}>
        <PressableImageFullscreen
          image={data.thumbnail?.[0]}
          containerStyle={{ width: "100%", aspectRatio: 2 }}
          imageStyleConfig={{
            resizeMode: "cover",
            containerStyle: { borderRadius: BorderRadius.md },
          }}
        />
      </View>

      {/* Title */}
      <HStack>
        <Text style={{ fontSize: Fontsize.h1, fontWeight: "900" }}>
          {data.name}
        </Text>
      </HStack>

      <HStack style={{ marginTop: 16, alignItems: "flex-start", gap: 12 }}>
        <VStack style={{ flex: 1, gap: 12 }}>
          <VStack>
            <HStack
              style={{
              }}
            >
              <Text style={{ fontSize: Fontsize.md }}>Address: </Text>
              <Text style={{ fontSize: Fontsize.md }}>{data.address}</Text>
            </HStack>
            <HStack>
              <Ionicons name="location-outline" size={20} color="black" />
              <HStack gap={Spacing.md}>
                <Text>{data.location.coordinates[0].toFixed(4)}</Text>
                <Text>{data.location.coordinates[1].toFixed(4)}</Text>
              </HStack>
            </HStack>
          </VStack>

          {/* OccupancyType */}
          <HStack style={{ flexDirection: "row", alignItems: "center" }}>
            <Text>Tenant Type: </Text>
            <Chip>{selected?.label}</Chip>
          </HStack>
        </VStack>

        <Button onPress={onViewRooms} mode="contained">
          View Rooms
        </Button>
      </HStack>
    </View>
  );
}

const s = StyleSheet.create({
  header: { gap: Spacing.md, position: "relative", overflow: "hidden" },
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

  inputContainerStyle: {
    borderWidth: 3,
    borderColor: "green",
    borderRadius: BorderRadius.md,
  },
});
