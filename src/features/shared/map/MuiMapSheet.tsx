import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";
import { View } from "@gluestack-ui/themed";
import { StyleSheet } from "react-native";
import {
  Portal,
  Surface,
  Text,
  Button,
  IconButton,
  useTheme,
} from "react-native-paper";

export const MapSheet = ({ visible, data, onClose, onNavigate }) => {
  const theme = useTheme();
  if (!visible || !data) return null;

  console.log("mui bottom tab picture: ", data);

  return (
    <Portal>
      <Surface
        style={[s.sheet, { backgroundColor: theme.colors.surface }]}
        elevation={4}
      >
        <IconButton
          icon="close"
          style={s.closeBtn}
          onPress={onClose}
          mode="contained-tonal"
        />

        <View style={s.content}>
          <Surface style={s.imageBox} elevation={0}>
            <PressableImageFullscreen
              image={data.thumbnail}
              containerStyle={{ flex: 1 }}
            />
          </Surface>

          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text variant="titleLarge" style={{ fontFamily: "Poppins-Bold" }}>
                {data.name}
              </Text>
              <Text
                variant="labelLarge"
                style={{
                  color: data.availabilityStatus
                    ? theme.colors.success
                    : theme.colors.error,
                }}
              >
                ₱{data.price} {!data.availabilityStatus && "• Not Available"}
              </Text>
            </View>
            <Button mode="contained" onPress={onNavigate} style={s.btn}>
              View
            </Button>
          </View>
        </View>
      </Surface>
    </Portal>
  );
};

const s = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  closeBtn: { position: "absolute", top: -10, right: -10, zIndex: 10 },
  imageBox: {
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  btn: { borderRadius: 8 },
});
