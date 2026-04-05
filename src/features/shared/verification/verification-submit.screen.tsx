import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Text,
  Surface,
  Button,
  useTheme,
  TouchableRipple,
  HelperText,
  Portal,
  Dialog,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import {
  CreateVerificationDocumentDto,
  CreateVerificationDocumentSchema,
  VerificationTypeMap,
} from "@/infrastructure/valid-docs/verification-document/verification-document.schema";
import { useCreateVerificaitonDocumentMutation } from "@/infrastructure/valid-docs/verification-document/verification-document.redux.api";
import PressableDocumentPicker from "@/components/ui/DocumentComponentUtilities/PressableDocumentPicker";
import PressableImagePicker from "@/components/ui/ImageComponentUtilities/PressableImagePicker";
import { getVerificationRole } from "./verificationConfig";
import { expoStorageCleaner } from "@/infrastructure/utils/expo-utils/expo-utils.service";

export default function VerificationSubmitScreen({ route, navigation }: any) {
  React.useEffect(() => {
    return () => expoStorageCleaner(["images", "documents"]);
  }, []);

  const theme = useTheme();
  const userId: number = route.params.userId;
  const documentFormMeta = route.params.meta;
  const userRole = getVerificationRole(documentFormMeta.role);
  const fileFormatOptions =
    documentFormMeta.role === "TENANT" ? "IMAGE" : "PDF";

  // --- Modal State ---
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] =
    useState<CreateVerificationDocumentDto | null>(null);

  const [createVerificationDocument, { isLoading, isError, isSuccess }] =
    useCreateVerificaitonDocumentMutation();
  const [showPicker, setShowPicker] = useState(false);
  const [pickedDocument, setPickedDocument] = useState<any>();
  const [pickedValidId, setPickedValidId] = useState<any>();

  const triggerHaptic = () => ReactNativeHapticFeedback.trigger("impactLight");

  const { control, handleSubmit, watch } =
    useForm<CreateVerificationDocumentDto>({
      resolver: zodResolver(CreateVerificationDocumentSchema),
      defaultValues: {
        userId: userId,
        type: documentFormMeta.type,
        fileFormat: fileFormatOptions,
        expiresAt: new Date().toISOString(),
      },
    });

  const selectedFileFormat = watch("fileFormat");
  const selectedType = watch("type");

  // Step 1: Validate and show the Confirmation Dialog
  const onPreSubmit = (data: CreateVerificationDocumentDto) => {
    if (!pickedDocument && selectedFileFormat === "PDF") {
      Alert.alert("Missing File", "Please pick a document before submitting.");
      return;
    }
    if (!pickedValidId && selectedFileFormat === "IMAGE") {
      Alert.alert("Missing Image", "Please pick a Valid ID before submitting.");
      return;
    }
    setFormData(data);
    setVisible(true);
  };

  // Step 2: The actual API call
  const handleConfirmSubmit = async () => {
    if (!formData) return;
    setVisible(false);
    triggerHaptic();

    const pickedFile = pickedValidId ?? pickedDocument;

    try {
      await createVerificationDocument({
        data: formData,
        file: pickedFile,
        sourceTarget: userRole,
      }).unwrap();

      ReactNativeHapticFeedback.trigger("notificationSuccess");
      Alert.alert("Success", "Document submitted successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
      await expoStorageCleaner(["images", "documents"]);
    } catch (e) {
      Alert.alert("Error", "Failed to submit document.");
    }
  };

  return (
    <StaticScreenWrapper variant="form">
      {/* 1. CONFIRMATION MODAL (PORTAL) */}
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={() => setVisible(false)}
          style={s.dialog}
        >
          <Dialog.Title style={s.dialogTitle}>Submit Document</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to submit your{" "}
              {documentFormMeta.displayName} for verification?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleConfirmSubmit}
              labelStyle={{ color: "white" }}
            >
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Header Info Card */}
      <Surface elevation={0} style={s.headerCard}>
        <View style={s.iconCircle}>
          <MaterialCommunityIcons
            name="file-upload-outline"
            size={32}
            color={theme.colors.primary}
          />
        </View>
        <Text variant="headlineSmall" style={s.title}>
          Submit Document
        </Text>
        <Text variant="titleMedium" style={s.roleText}>
          {documentFormMeta.displayName}
        </Text>
        <Text variant="bodySmall" style={s.description}>
          {selectedType && VerificationTypeMap[selectedType]?.description}
        </Text>
      </Surface>

      {/* Form Section */}
      <View style={s.formContainer}>
        <Text variant="labelLarge" style={s.inputLabel}>
          Expiration Date
        </Text>
        <Controller
          control={control}
          name="expiresAt"
          render={({ field: { onChange, value } }) => (
            <>
              <Surface elevation={0} style={s.datePickerSurface}>
                <TouchableRipple
                  onPress={() => {
                    triggerHaptic();
                    setShowPicker(true);
                  }}
                  style={s.dateRipple}
                  borderless
                >
                  <View style={s.dateInner}>
                    <Text variant="bodyLarge">
                      {new Date(value).toDateString()}
                    </Text>
                    <MaterialCommunityIcons
                      name="calendar-month"
                      size={24}
                      color={theme.colors.outline}
                    />
                  </View>
                </TouchableRipple>
              </Surface>
              {showPicker && (
                <DateTimePicker
                  value={new Date(value)}
                  mode="date"
                  onChange={(event, date) => {
                    setShowPicker(false);
                    if (event.type === "set" && date)
                      onChange(date.toISOString());
                  }}
                />
              )}
            </>
          )}
        />

        <Text variant="labelLarge" style={[s.inputLabel, { marginTop: 24 }]}>
          Upload {selectedFileFormat}
        </Text>
        <View style={s.pickerWrapper}>
          {selectedFileFormat === "PDF" ? (
            <PressableDocumentPicker
              pickDocument={setPickedDocument}
              removeDocument={() => setPickedDocument(undefined)}
            />
          ) : (
            <PressableImagePicker
              image={pickedValidId}
              pickImage={(img: any) => {
                triggerHaptic();
                setPickedValidId(img);
              }}
              removeImage={() => setPickedValidId(undefined)}
            />
          )}
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit(onPreSubmit)}
          disabled={isLoading}
          loading={isLoading}
          style={s.submitBtn}
          contentStyle={s.submitBtnContent}
          labelStyle={s.submitBtnLabel}
        >
          {isLoading ? "Uploading..." : "Submit for Verification"}
        </Button>

        {isError && (
          <HelperText type="error" visible={true} style={s.statusText}>
            Submission failed. Please try again.
          </HelperText>
        )}
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  // ... your existing styles ...
  roleText: {
    color: "#6200ee", // use your theme primary
    fontFamily: "Poppins-SemiBold",
  },
  dialog: {
    backgroundColor: "white",
    borderRadius: 12,
  },
  dialogTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
  },
  headerCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#F0F0F5",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontFamily: "Poppins-Bold",
    marginBottom: 4,
  },
  description: {
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
    fontFamily: "Poppins-Regular",
  },
  formContainer: {
    paddingHorizontal: 4,
  },
  inputLabel: {
    fontFamily: "Poppins-Medium",
    marginBottom: 8,
    opacity: 0.8,
  },
  datePickerSurface: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  dateRipple: {
    padding: 14,
  },
  dateInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerWrapper: {
    marginTop: 8,
  },
  submitBtn: {
    marginTop: 32,
    borderRadius: 12,
  },
  submitBtnContent: {
    height: 54,
  },
  submitBtnLabel: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
  statusText: {
    textAlign: "center",
    marginTop: 12,
    fontFamily: "Poppins-Medium",
  },
});
