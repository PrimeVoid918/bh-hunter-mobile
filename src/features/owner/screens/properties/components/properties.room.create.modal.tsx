import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  Portal,
  Button,
  Text,
  useTheme,
  Divider,
  Chip,
} from "react-native-paper";
import { ScrollView, View, StyleSheet, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "@gluestack-ui/themed";

import { FormField } from "@/components/ui/FormFields/FormField";
import PressableImagePicker from "@/components/ui/ImageComponentUtilities/PressableImagePicker";
import BottomSheetSelector from "@/components/ui/BottomSheet/BottomSheetSelector";
import {
  CreateRoomInput,
  CreateRoomInputSchema,
  roomTypeOptions,
  roomFurnishingTypeOptions,
} from "@/infrastructure/room/rooms.schema";
import { ROOM_FEATURE_TAGS } from "@/infrastructure/room/rooms.constants";
import { pickImageExpo } from "@/infrastructure/image/image.service";
import { Spacing, BorderRadius } from "@/constants";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoomInput) => void;
  initialData?: CreateRoomInput;
}

export default function PropertiesRoomCreateModal({
  visible,
  onClose,
  onSubmit,
  initialData,
}: ModalProps) {
  const theme = useTheme();
  const [selTypeOpen, setSelTypeOpen] = useState(false);
  const [selFurnOpen, setSelFurnOpen] = useState(false);

  const { control, handleSubmit, setValue, getValues, watch, reset } =
    useForm<CreateRoomInput>({
      resolver: zodResolver(CreateRoomInputSchema) as any,
      defaultValues: initialData || {
        roomNumber: "",
        maxCapacity: 0,

        price: 0,
        tags: [],
        thumbnail: [],
        gallery: [],
      },
    });

  useEffect(() => {
    if (visible)
      reset(
        initialData || {
          roomNumber: "",
          maxCapacity: 0,
          price: 0,
          tags: [],
          thumbnail: [],
          gallery: [],
        },
      );
  }, [visible, initialData, reset]);

  /* ------------------------- Image Logic ------------------------- */
  const handlePickGalleryImages = async () => {
    const pick = await pickImageExpo(10);
    if (pick?.length) {
      const currentGallery = getValues("gallery") || [];
      setValue("gallery", [...currentGallery, ...pick]);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    const currentGallery = getValues("gallery") || [];
    const updatedGallery = currentGallery.filter((_, i) => i !== index);
    setValue("gallery", updatedGallery);
  };

  const selectedTags = watch("tags") || [];

  const toggleTag = (tag: string) => {
    const current = [...selectedTags];
    const idx = current.indexOf(tag as any);
    if (idx > -1) current.splice(idx, 1);
    else current.push(tag as any);
    setValue("tags", current);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={m.modalContainer}
      >
        <Text variant="headlineSmall" style={m.title}>
          {initialData ? "Edit Room" : "Add New Room"}
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
          <View style={{ gap: Spacing.md }}>
            {/* Primary Thumbnail */}
            <Text variant="labelLarge" style={m.sectionLabel}>
              Cover Photo
            </Text>
            <PressableImagePicker
              image={watch("thumbnail")?.[0]}
              pickImage={(img) => setValue("thumbnail", [img])}
              removeImage={() => setValue("thumbnail", [])}
            />

            {/* Gallery Section - Mirroring Boarding House Style */}
            <View style={m.gallerySection}>
              <View style={m.galleryHeader}>
                <Text variant="labelLarge" style={m.sectionLabel}>
                  Room Gallery
                </Text>
                <Pressable onPress={handlePickGalleryImages}>
                  <Text
                    style={{ color: theme.colors.primary, fontWeight: "bold" }}
                  >
                    Add Images
                  </Text>
                </Pressable>
              </View>

              <Controller
                control={control}
                name="gallery"
                render={({ field: { value } }) => (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={m.galleryScroll}
                  >
                    {value?.map((image, index) => (
                      <View key={index} style={m.galleryItem}>
                        <Image
                          source={{ uri: image.uri }}
                          style={m.galleryImage}
                          alt="Room Gallery"
                        />
                        <Pressable
                          onPress={() => handleRemoveGalleryImage(index)}
                          style={m.galleryRemove}
                        >
                          <Ionicons
                            name="close-circle"
                            size={22}
                            color="white"
                          />
                        </Pressable>
                      </View>
                    ))}
                    {(!value || value.length === 0) && (
                      <View style={m.emptyGallery}>
                        <Text variant="bodySmall" style={{ opacity: 0.5 }}>
                          No images added
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                )}
              />
            </View>

            <Divider />

            {/* Core Info */}
            <View style={m.row}>
              <FormField
                name="roomNumber"
                control={control}
                isEditing
                label="Room #"
                containerStyle={{ flex: 1 }}
              />
              <FormField
                name="price"
                control={control}
                isEditing
                label="Price"
                keyboardType="numeric"
                prefix="₱"
                containerStyle={{ flex: 1 }}
              />
            </View>

            <FormField
              name="maxCapacity"
              control={control}
              isEditing
              label="Capacity (Pax)"
              keyboardType="numeric"
            />

            <FormField
              name="description"
              control={control}
              isEditing
              inputType="paragraph"
              label="About Room"
            />

            <View style={m.row}>
              <Button
                mode="outlined"
                style={{ flex: 1 }}
                onPress={() => setSelTypeOpen(true)}
                icon="home-outline"
              >
                {watch("roomType") || "Type"}
              </Button>
              <Button
                mode="outlined"
                style={{ flex: 1 }}
                onPress={() => setSelFurnOpen(true)}
                icon="bed-outline"
              >
                {watch("furnishingType") || "Furnish"}
              </Button>
            </View>

            <Divider />

            <Text variant="labelLarge">Amenities</Text>
            <View style={m.chipGroup}>
              {ROOM_FEATURE_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  selected={selectedTags.includes(tag as any)}
                  onPress={() => toggleTag(tag)}
                  showSelectedCheck
                  mode="outlined"
                >
                  {tag}
                </Chip>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={m.footer}>
          <Button onPress={onClose}>Cancel</Button>
          <Button mode="contained" onPress={handleSubmit(onSubmit)}>
            {initialData ? "Update Room" : "Add Room"}
          </Button>
        </View>

        {/* Action Sheets */}
        <BottomSheetSelector
          isOpen={selTypeOpen}
          onClose={() => setSelTypeOpen(false)}
          options={roomTypeOptions}
          onSelect={(v) => {
            setValue("roomType", v);
            setSelTypeOpen(false);
          }}
        />
        <BottomSheetSelector
          isOpen={selFurnOpen}
          onClose={() => setSelFurnOpen(false)}
          options={roomFurnishingTypeOptions}
          onSelect={(v) => {
            setValue("furnishingType", v);
            setSelFurnOpen(false);
          }}
        />
      </Modal>
    </Portal>
  );
}

const m = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: BorderRadius.lg,
    maxHeight: "90%",
  },
  title: { marginBottom: 16, fontWeight: "bold" },
  sectionLabel: { marginBottom: 4 },
  row: { flexDirection: "row", gap: 12 },
  chipGroup: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  gallerySection: { marginTop: Spacing.xs },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  galleryScroll: { flexDirection: "row" },
  galleryItem: { marginRight: 12, position: "relative" },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    backgroundColor: "#f0f0f0",
  },
  galleryRemove: { position: "absolute", top: 4, right: 4 },
  emptyGallery: {
    height: 100,
    width: 100,
    borderWidth: 1,
    borderColor: "#eee",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 10,
  },
});
