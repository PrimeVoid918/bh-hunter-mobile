import { Ionicons } from "@expo/vector-icons";
import { View } from "@gluestack-ui/themed";
import { Pressable } from "react-native";

interface StarRatingInputProps {
  value: number; // 1–5
  onChange: (value: number) => void;
  size?: number;
  filledColor: string;
  hollowColor: string;
}

export default function StarRatingInput({
  value,
  onChange,
  size = 24,
  filledColor,
  hollowColor,
}: StarRatingInputProps) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const filled = starValue <= value;

        return (
          <Pressable
            key={starValue}
            onPress={() => onChange(starValue)}
            hitSlop={8}
          >
            <Ionicons
              name={filled ? "star" : "star-outline"}
              size={size}
              color={filled ? filledColor : hollowColor}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
