import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Surface,
  Text,
  Button,
  Switch,
  Chip,
  useTheme,
  TouchableRipple,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { HStack, VStack } from "@gluestack-ui/themed";
import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";
import { FormField } from "@/components/ui/FormFields/FormField";
import { BottomSheetTriggerField } from "@/components/ui/BottomSheet/BottomSheetTriggerField";
import { BorderRadius, Spacing } from "@/constants";
import { formatNumberWithCommas } from "../../../infrastructure/utils/string.formatter.util";

// Types
import {
  FindOneRoom,
  PatchRoomInput,
  RoomFurnishingType,
  roomFurnishingTypeOptions,
  RoomType,
  roomTypeOptions,
} from "@/infrastructure/room/rooms.schema";
import {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

interface RoomHeaderInterface {
  data: FindOneRoom;
  control?: Control<PatchRoomInput>;
  errors?: FieldErrors<PatchRoomInput>;
  form: {
    getValues: UseFormGetValues<PatchRoomInput>;
    setValue: UseFormSetValue<PatchRoomInput>;
    watch: UseFormWatch<PatchRoomInput>;
  };
  isEditing: boolean;
  goToBook?: () => void;
  onOpenFurnishingTypeSheet?: () => void;
  onOpenRoomTypeSheet?: () => void;
}

/**
 * EDIT MODE: Focuses on input accessibility and clear labeling
 */
export function RoomHeaderEdit({
  data,
  control,
  isEditing,
  form,
  onOpenFurnishingTypeSheet,
  onOpenRoomTypeSheet,
}: RoomHeaderInterface) {
  const { colors } = useTheme();
  const availability = form.watch("availabilityStatus");

  return (
    <Surface style={s.container} elevation={0}>
      <PressableImageFullscreen
        image={data?.thumbnail?.[0] ?? null}
        containerStyle={s.imageContainer}
        imageStyleConfig={{
          resizeMode: "cover",
          containerStyle: { borderRadius: BorderRadius.md },
        }}
      />
      <VStack style={s.contentWrapper}>
        {/* Row 1: Code and Status */}
        <HStack justifyContent="space-between" alignItems="flex-start">
          <VStack style={{ flex: 1, gap: 2 }}>
            <Text variant="labelSmall" style={s.inputLabel}>
              ROOM CODE
            </Text>
            <FormField
              name="roomNumber"
              control={control!}
              isEditing={isEditing}
              textStyle={s.titleText}
              inputConfig={{ placeholder: "e.g. RM-101" }}
            />
          </VStack>
          <VStack alignItems="center">
            <Text
              variant="labelSmall"
              style={[s.inputLabel, { textAlign: "center" }]}
            >
              STATUS
            </Text>
            {!isEditing && <StatusChip status={data.availabilityStatus} />}
            {isEditing && (
              <Switch
                value={availability}
                onValueChange={(val) =>
                  form.setValue("availabilityStatus", val, {
                    shouldDirty: true,
                  })
                }
                color={colors.primary}
              />
            )}
          </VStack>
        </HStack>

        <View style={s.divider} />

        {/* Row 2: Room Metrics (Price & Capacity) */}
        <HStack style={s.metricsRow}>
          <VStack style={{ flex: 1 }}>
            <Text variant="labelSmall" style={s.inputLabel}>
              PER PERSON RENT
            </Text>
            <FormField
              name="price"
              control={control!}
              isEditing={isEditing}
              prefix="₱ "
              inputConfig={{
                keyboardType: "numeric",
                placeholder: "0.00",
              }}
            />
          </VStack>
          <View style={s.verticalDividerHairline} />
          <VStack style={{ flex: 1 }}>
            <Text variant="labelSmall" style={s.inputLabel}>
              MAX TENANTS
            </Text>
            <FormField
              name="maxCapacity"
              control={control!}
              isEditing={isEditing}
              inputConfig={{
                keyboardType: "numeric",
                placeholder: "1",
              }}
            />
          </VStack>
        </HStack>

        <View style={s.divider} />

        {/* Row 3: Selectors */}
        <HStack style={s.inputGrid}>
          <VStack style={{ flex: 1 }}>
            <Text variant="labelSmall" style={s.inputLabel}>
              ROOM TYPE
            </Text>
            <BottomSheetTriggerField
              name="roomType"
              control={control!}
              options={roomTypeOptions}
              isEditing={isEditing}
              onOpen={onOpenRoomTypeSheet!}
            />
          </VStack>
          <VStack style={{ flex: 1 }}>
            <Text variant="labelSmall" style={s.inputLabel}>
              FURNISHING
            </Text>
            <BottomSheetTriggerField
              name="furnishingType"
              control={control!}
              options={roomFurnishingTypeOptions}
              isEditing={isEditing}
              onOpen={onOpenFurnishingTypeSheet!}
            />
          </VStack>
        </HStack>
      </VStack>
    </Surface>
  );
}

/**
 * VIEW MODE: Focuses on "Discovery" - Price, Capacity, and Status
 */
export function RoomHeaderView({ data, goToBook }: RoomHeaderInterface) {
  const { colors } = useTheme();

  const selectedRoomType = roomTypeOptions.find(
    (o) => o.value === data.roomType,
  )?.label;
  const selectedFurnishing = roomFurnishingTypeOptions.find(
    (o) => o.value === data.furnishingType,
  )?.label;

  return (
    <Surface style={s.container} elevation={0}>
      <View style={s.imageWrapper}>
        <PressableImageFullscreen
          image={data?.thumbnail?.[0]}
          containerStyle={s.imageContainer}
          imageStyleConfig={{
            resizeMode: "cover",
            containerStyle: { borderRadius: BorderRadius.md },
          }}
        />
        <View style={s.statusBadge}>
          <StatusChip status={data?.availabilityStatus} />
        </View>
      </View>

      <VStack style={s.contentWrapper}>
        <HStack justifyContent="space-between" alignItems="center">
          <VStack>
            <Text style={s.titleText}>Room {data?.roomNumber}</Text>
            <Text
              variant="bodySmall"
              style={{ color: colors.outline, fontFamily: "Poppins-Regular" }}
            >
              {selectedRoomType} • {selectedFurnishing}
            </Text>
          </VStack>
          <VStack alignItems="flex-end">
            <Text style={[s.priceText, { color: colors.primary }]}>
              ₱{formatNumberWithCommas(data?.price)}
            </Text>
            <Text variant="labelSmall" style={{ color: colors.outline }}>
              PER PERSON
            </Text>
          </VStack>
        </HStack>

        <HStack style={s.infoRow}>
          <HStack style={s.infoItem}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={20}
              color={colors.primary}
            />
            <Text variant="bodyMedium" style={s.infoText}>
              {data?.maxCapacity} Tenants
            </Text>
          </HStack>
          <View style={s.verticalDivider} />
          <HStack style={s.infoItem}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={20}
              color={colors.primary}
            />
            <Text variant="bodyMedium" style={s.infoText}>
              Updated {new Date(data?.updatedAt).toLocaleDateString()}
            </Text>
          </HStack>
        </HStack>

        <Button
          onPress={goToBook}
          mode="contained"
          icon="calendar-plus"
          contentStyle={{ height: 48 }}
          style={[s.actionButton, { backgroundColor: colors.primary }]}
          labelStyle={{ fontFamily: "Poppins-SemiBold", fontSize: 14 }}
        >
          Apply for Booking
        </Button>
      </VStack>
    </Surface>
  );
}

const StatusChip = ({ status }: { status: boolean }) => {
  const { colors } = useTheme();
  return (
    <Chip
      icon={status ? "check-circle" : "close-circle"}
      style={{
        backgroundColor: status ? "#E8F5E9" : "#FFEBEE",
        borderColor: status ? "#80CFA9" : "#D64545",
        borderWidth: 1,
        height: 32,
      }}
      textStyle={{
        color: status ? "#2E7D32" : "#C62828",
        fontSize: 12,
        fontFamily: "Poppins-Medium",
      }}
    >
      {status ? "Available" : "Not Available"}
    </Chip>
  );
};

const s = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  imageWrapper: {
    position: "relative",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1.8,
  },
  statusBadge: {
    position: "absolute",
    bottom: Spacing.sm,
    left: Spacing.sm,
  },
  contentWrapper: {
    padding: Spacing.base,
  },

  priceText: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
  },
  infoRow: {
    backgroundColor: "#F7F9FC",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: "#F0F0F5",
    alignItems: "center",
  },
  infoItem: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },
  infoText: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#CCCCCC",
    marginHorizontal: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F5",
    marginVertical: Spacing.md,
  },
  inputGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  actionButton: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  inputLabel: {
    color: "#767474", // theme.colors.outline
    fontFamily: "Poppins-Medium",
    marginBottom: 4,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  metricsRow: {
    backgroundColor: "#F7F9FC", // Light surface tint for "data" fields
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    alignItems: "center",
    gap: Spacing.md,
  },
  verticalDividerHairline: {
    width: 1,
    height: "60%",
    backgroundColor: "#CCCCCC",
    opacity: 0.5,
  },
  // Ensure titleText doesn't have extra margins that break the flow
  titleText: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#1A1A1A",
    margin: 0,
    padding: 0,
  },
});
