import React, { forwardRef } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Surface, Button, useTheme } from "react-native-paper";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Spacing, BorderRadius } from "@/constants";
import { BoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.schema";
import PressableImageFullscreen from "../../../components/ui/ImageComponentUtilities/PressableImageFullscreen";

interface Props {
  data: BoardingHouse | null;
  onClose: () => void;
  onNavigate: () => void;
}

export const MapSheet = forwardRef<BottomSheet, Props>(
  ({ data, onClose, onNavigate }, ref) => {
    const theme = useTheme();
    const snapPoints = React.useMemo(() => ["32%", "80%"], []);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.outlineVariant }}
      >
        <BottomSheetView style={s.container}>
          {data && (
            <View style={{ flex: 1 }}>
              {/* Image Container - M3 Contained */}
              <Surface style={s.imageContainer} elevation={0}>
                <PressableImageFullscreen
                  image={data.thumbnail}
                  imageStyleConfig={{
                    resizeMode: "cover",
                    containerStyle: { borderRadius: BorderRadius.md },
                  }}
                  containerStyle={{ flex: 1 }}
                />
              </Surface>

              {/* Header Info */}
              <View style={s.header}>
                <View style={{ flex: 1 }}>
                  <Text variant="headlineSmall" style={s.title}>
                    {data.name}
                  </Text>
                  <Text
                    variant="titleMedium"
                    style={{
                      color: data.availabilityStatus
                        ? theme.colors.primary
                        : theme.colors.error,
                    }}
                  >
                    ₱{data.price} / month {!data.availabilityStatus && "• FULL"}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.outline }}
                  >
                    {data.address}
                  </Text>
                </View>

                <Button
                  mode="contained"
                  onPress={onNavigate}
                  disabled={!data.availabilityStatus} // Disable if full
                  style={s.button}
                  contentStyle={{ height: 48 }}
                >
                  {data.availabilityStatus ? "View Details" : "No Vacancy"}
                </Button>
              </View>

              {/* Description Area */}
              <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
                <Text variant="bodyMedium" style={s.description}>
                  {data.description ||
                    "No description available for this property."}
                </Text>
              </ScrollView>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

const s = StyleSheet.create({
  container: { flex: 1, padding: Spacing.base },
  imageContainer: {
    height: 180,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  header: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  title: { fontFamily: "Poppins-Bold", lineHeight: 28 },
  button: { borderRadius: BorderRadius.md, alignSelf: "center" },
  scroll: { marginTop: Spacing.md },
  description: { lineHeight: 22, opacity: 0.8, paddingBottom: 40 },
});
