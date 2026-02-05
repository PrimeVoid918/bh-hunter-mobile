import { Colors } from "@/constants";
import React, { useState, useRef } from "react";
import {
  TextInput,
  StyleSheet,
  ScrollView,
  TextStyle,
  ViewStyle,
} from "react-native";

interface AutoExpandingInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxHeight?: number;
  style?: TextStyle;
  containerStyle?: ViewStyle;
}

export default function AutoExpandingInput({
  value,
  onChangeText,
  placeholder = "Type your message...",
  maxHeight = 200,
  style,
  containerStyle,
}: AutoExpandingInputProps) {
  const [inputHeight, setInputHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.container, containerStyle]}
      scrollEnabled={inputHeight >= maxHeight}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        defaultValue={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.TextInverse[1] || "#999"}
        multiline
        style={[
          styles.input,
          { height: Math.min(inputHeight, maxHeight) },
          style,
        ]}
        onContentSizeChange={(e) =>
          setInputHeight(e.nativeEvent.contentSize.height + 16)
        }
        textAlignVertical="top"
        scrollEnabled={inputHeight >= maxHeight}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    padding: "2%",
    color: Colors.TextInverse[1],
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3, // for Android shadow
  },
});
