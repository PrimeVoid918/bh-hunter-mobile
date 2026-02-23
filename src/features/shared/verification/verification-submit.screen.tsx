import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Text,
  Surface,
  Button,
  useTheme,
  TouchableRipple,
  HelperText,
  ActivityIndicator,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Shared Logic/Components (Preserved)
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

export default function VerificationSubmitScreen({ route }: any) {
  const theme = useTheme();
  const userId: number = route.params.userId;
  const documentFormMeta = route.params.meta;
  const userRole = getVerificationRole(documentFormMeta.role);
  const fileFormatOptions =
    documentFormMeta.role === "TENANT" ? "IMAGE" : "PDF";

  const [createVerificationDocument, { isLoading, isError, isSuccess }] =
    useCreateVerificaitonDocumentMutation();
  const [showPicker, setShowPicker] = React.useState(false);
  const [pickedDocument, setPickedDocument] = React.useState<any>();
  const [pickedValidId, setPickedValidId] = React.useState<any>();

  const triggerHaptic = () => ReactNativeHapticFeedback.trigger("impactLight");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateVerificationDocumentDto>({
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

  const onSubmit = (data: CreateVerificationDocumentDto) => {
    if (!pickedDocument && selectedFileFormat === "PDF") {
      Alert.alert("Missing File", "Please pick a document before submitting.");
      return;
    }
    if (!pickedValidId && selectedFileFormat === "IMAGE") {
      Alert.alert("Missing Image", "Please pick a Valid ID before submitting.");
      return;
    }

    const pickedFile = pickedValidId ?? pickedDocument;

    showModal({
      title: "Submit Document",
      message: `Confirm submission of your ${documentFormMeta.displayName}?`,
      onConfirm: async () => {
        triggerHaptic();
        try {
          await createVerificationDocument({
            data,
            file: pickedFile,
            sourceTarget: userRole,
          }).unwrap();
          ReactNativeHapticFeedback.trigger("notificationSuccess");
          Alert.alert("Success", "Document submitted successfully!");
        } catch (e) {
          Alert.alert("Error", "Failed to submit document.");
        }
      },
    });
  };

  return (
    <StaticScreenWrapper variant="form">
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
        <Text
          variant="titleMedium"
          style={{
            color: theme.colors.primary,
            fontFamily: "Poppins-SemiBold",
          }}
        >
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

        {/* Action Buttons */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
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
        {isSuccess && (
          <Text style={[s.statusText, { color: "#80CFA9" }]}>
            ✓ Document uploaded successfully
          </Text>
        )}
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  headerCard: {
    padding: 24,
    borderRadius: 16, // xl radius
    backgroundColor: "#F0F0F5", // surfaceVariant
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#CCCCCC", // outlineVariant
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
    borderRadius: 12, // lg radius
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
