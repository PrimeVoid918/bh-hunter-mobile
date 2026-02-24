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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetTriggerField } from "@/components/ui/BottomSheet/BottomSheetTriggerField";
import {
  Button,
  Chip,
  Surface,
  Switch,
  Text,
  useTheme,
} from "react-native-paper";
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
  form,
  onViewRooms,
  onOpenOccupancySheet,
}: BoardingHouseHeaderInterface) {
  const { colors } = useTheme();
  const availability = form.watch("availabilityStatus");

  return (
    <Surface style={s.container} elevation={0}>
      <PressableImageFullscreen
        image={data.thumbnail?.[0]}
        containerStyle={s.imageContainer}
        imageStyleConfig={{
          resizeMode: "cover",
          containerStyle: { borderRadius: BorderRadius.md },
        }}
      />

      <VStack style={s.contentWrapper}>
        <HStack justifyContent="space-between" alignItems="flex-start">
          <VStack style={{ flex: 1 }}>
            <FormField
              name="name"
              control={control}
              isEditing={isEditing}
              textStyle={s.titleText}
            />
            <HStack style={s.locationRow}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={16}
                color={colors.primary}
              />
              <FormField
                name="address"
                control={control}
                isEditing={isEditing}
                textStyle={s.addressText}
              />
            </HStack>
          </VStack>

          <VStack alignItems="center" style={s.actionCol}>
            <Text variant="labelSmall" style={{ color: colors.outline }}>
              STATUS
            </Text>
            {isEditing ? (
              <Switch
                value={availability}
                onValueChange={(val) =>
                  form.setValue("availabilityStatus", val, {
                    shouldDirty: true,
                  })
                }
                color={colors.primary}
              />
            ) : (
              <StatusChip status={data.availabilityStatus} />
            )}
          </VStack>
        </HStack>

        <HStack style={s.metaRow}>
          <VStack style={{ flex: 1 }}>
            <Text variant="labelSmall" style={s.label}>
              TENANT POLICY
            </Text>
            <BottomSheetTriggerField
              name="occupancyType"
              control={control}
              options={occupancyTypeOptions}
              isEditing={isEditing}
              onOpen={onOpenOccupancySheet}
            />
          </VStack>

          <Button
            onPress={onViewRooms}
            mode="contained"
            icon="door-open"
            style={s.roomButton}
          >
            Manage Rooms
          </Button>
        </HStack>
      </VStack>
    </Surface>
  );
}

// --- TENANT/VIEW VERSION ---
export function BoardingHouseHeaderView({
  data,
  onViewRooms,
}: BoardingHouseHeaderInterface) {
  const { colors } = useTheme();
  const selected = occupancyTypeOptions.find(
    (o) => o.value === data.occupancyType,
  );

  return (
    <Surface style={s.container} elevation={0}>
      <PressableImageFullscreen
        image={data.thumbnail?.[0]}
        containerStyle={s.imageContainer}
        imageStyleConfig={{
          resizeMode: "cover",
          containerStyle: { borderRadius: BorderRadius.md },
        }}
      />

      <VStack style={s.contentWrapper}>
        <HStack justifyContent="space-between" alignItems="center">
          <VStack style={{ flex: 1 }}>
            <Text style={s.titleText}>{data.name}</Text>
            <HStack style={s.locationRow}>
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={16}
                color={colors.primary}
              />
              <Text style={s.addressText}>{data.address}</Text>
            </HStack>
          </VStack>
          <StatusChip status={data.availabilityStatus} />
        </HStack>

        <HStack style={s.metaRow} alignItems="center">
          <HStack style={s.policyContainer}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={18}
              color={colors.outline}
            />
            <Text variant="bodyMedium" style={{ marginLeft: 4 }}>
              {selected?.label}
            </Text>
          </HStack>

          <Button
            onPress={onViewRooms}
            mode="contained-tonal"
            icon="home-search"
            style={s.roomButton}
          >
            Explore Rooms
          </Button>
        </HStack>
      </VStack>
    </Surface>
  );
}

// Helper Sub-component
const StatusChip = ({ status }: { status: boolean }) => {
  const { colors } = useTheme();
  return (
    <Chip
      icon={status ? "check-decagram" : "alert-circle-outline"}
      textStyle={{ fontSize: 11, fontWeight: "700" }}
      style={{
        backgroundColor: status ? "#E8F5E9" : "#FFEBEE",
        borderColor: status ? "#81C784" : "#E57373",
        borderWidth: 1,
      }}
      selectedColor={status ? "#2E7D32" : "#C62828"}
    >
      {status ? "Available" : "Not Available"}
    </Chip>
  );
};

const s = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#CCCCCC", // outlineVariant
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 2.2,
  },
  contentWrapper: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  titleText: {
    fontSize: Fontsize.xl,
    fontFamily: "Poppins-Bold",
    lineHeight: 28,
  },
  locationRow: {
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  addressText: {
    fontSize: Fontsize.sm,
    color: "#767474", // outline
    fontFamily: "Poppins-Regular",
  },
  actionCol: {
    minWidth: 80,
    gap: 2,
  },
  metaRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairline,
    borderTopColor: "#CCCCCC",
    gap: Spacing.md,
  },
  label: {
    color: "#9A9A9A",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  policyContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  roomButton: {
    borderRadius: BorderRadius.md,
  },
});
