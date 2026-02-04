import { View, Text, StyleSheet, Alert } from "react-native";
import React from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { Colors, GlobalStyle } from "@/constants";
import { useCreateVerificaitonDocumentMutation } from "@/infrastructure/valid-docs/verification-document/verification-document.redux.api";
import { Controller, useForm } from "react-hook-form";
import {
  CreateVerificationDocumentDto,
  FileFormatSchema,
  VerificationType,
} from "@/infrastructure/valid-docs/verification-document/verification-document.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateVerificationDocumentSchema,
  VerificationTypeMap,
} from "@/infrastructure/valid-docs/verification-document/verification-document.schema";
import { Button } from "@gluestack-ui/themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { AppDocumentFile } from "@/infrastructure/document/document.schema";
import PressableDocumentPicker from "@/components/ui/DocumentComponentUtilities/PressableDocumentPicker";
import { useDecisionModal } from "@/components/ui/FullScreenDecisionModal";
import {
  getVerificationRole,
  VerificationSubmitScreenMeta,
} from "./verificationConfig";
import { FormField } from "../../../components/ui/FormFields/FormField";
import PressableImagePicker from "@/components/ui/ImageComponentUtilities/PressableImagePicker";
import { AppImageFile } from "@/infrastructure/image/image.schema";

export default function VerificationSubmitScreen({ route }) {
  const userId: number = route.params.userId;
  const documentFormMeta: VerificationSubmitScreenMeta = route.params.meta;
  const [createVerificationDocument, { isLoading, isError, error, isSuccess }] =
    useCreateVerificaitonDocumentMutation();

  const userRole = getVerificationRole(documentFormMeta.role);
  
  const fileFormatOptions =
    documentFormMeta.role === "TENANT" ? "IMAGE" : "PDF";

  const {
    control,
    handleSubmit,
    watch,
    setValue,
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

  const [showPicker, setShowPicker] = React.useState(false);
  const [pickedDocument, setPickedDocument] = React.useState<AppDocumentFile>();
  const [pickedValidId, setPickedValidId] = React.useState<AppImageFile>();
  const handlePickThumbnailImage = React.useCallback(
    (image: AppImageFile) => {
      setPickedValidId(image);
    },
    [setValue],
  );

  const { showModal } = useDecisionModal();
  const selectedFileFormat = watch("fileFormat");

  const onSubmit = (data: CreateVerificationDocumentDto) => {
    console.log("data send:");

    if (!pickedDocument && selectedFileFormat == "PDF") {
      Alert.alert("Error", "Please pick a document before submitting.");
      return;
    }

    if (!pickedValidId && selectedFileFormat == "IMAGE") {
      Alert.alert("Error", "Please pick a Valid ID before submitting.");
      return;
    }

    const pickedFile = pickedValidId ?? pickedDocument;

    showModal({
      title: "Submit Verification Document",
      message: `Are you sure you want to submit your ${documentFormMeta.displayName}?`,
      cancelText: "Cancel",
      confirmText: "Submit",
      onConfirm: async () => {
        try {
          const res = await createVerificationDocument({
            data,
            file: pickedFile,
            sourceTarget: userRole,
          }).unwrap();

          console.log("Verification submission response:", res);
          Alert.alert("Document submitted successfully!");
        } catch (e) {
          console.error("Submit error:", e);
          Alert.alert("Failed to submit document.");
        }
      },
    });
  };

  const selectedType = watch("type");

  const verificationTypeKeys = Object.keys(
    VerificationTypeMap,
  ) as VerificationType[];

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer, s.mainConatiner]}
      contentContainerStyle={[
        GlobalStyle.GlobalsContentContainer,
        s.contianerStyle,
      ]}
    >
      <View>
        <View style={s.container}>
          <Text style={[s.label, s.textColor]}>Submit a Document</Text>
          <Text style={[{ color: "white" }]}>
            {documentFormMeta.displayName}
          </Text>
          <Text style={s.description}>
            {selectedType && selectedType in VerificationTypeMap
              ? VerificationTypeMap[selectedType as VerificationType]
                  .description
              : ""}
          </Text>

          {/* <Text style={s.label}>Select File Format</Text>
          <Controller
            control={control}
            name="fileFormat"
            render={({ field: { onChange, value } }) => (
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={{ color: Colors.TextInverse[1] }}
              >
                {FileFormatSchema.options.map((format) => (
                  <Picker.Item key={format} label={format} value={format} />
                ))}
              </Picker>
            )}
          /> */}

          <Text style={s.label}>Expiration Date</Text>
          <Controller
            control={control}
            name="expiresAt"
            render={({ field: { onChange, value } }) => (
              <>
                <Text
                  style={{
                    padding: 12,
                    borderWidth: 1,
                    borderRadius: 6,
                    marginTop: 8,
                    color: Colors.TextInverse[1],
                  }}
                  onPress={() => setShowPicker(true)}
                >
                  {new Date(value).toDateString()}
                </Text>

                {showPicker && (
                  <DateTimePicker
                    value={new Date(value)}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowPicker(false);

                      if (event.type === "set" && date) {
                        onChange(date.toISOString());
                      }
                    }}
                  />
                )}
              </>
            )}
          />
          {selectedFileFormat === "PDF" ? (
            <PressableDocumentPicker
              pickDocument={setPickedDocument}
              removeDocument={() => setPickedDocument(undefined)}
            />
          ) : (
            <PressableImagePicker
              image={pickedValidId}
              pickImage={handlePickThumbnailImage}
              removeImage={() => setPickedValidId(undefined)}
            />
          )}

          <Button onPress={handleSubmit(onSubmit)} disabled={isLoading}>
            <Text>Submit Document</Text>
          </Button>
          {isError && (
            <Text style={s.errorText}>Failed to submit document.</Text>
          )}
          {isSuccess && (
            <Text style={s.successText}>Document submitted successfully!</Text>
          )}
        </View>
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  mainConatiner: {},
  contianerStyle: {},

  textColor: {
    color: Colors.TextInverse[2],
  },

  container: {
    padding: 16,
  },
  label: {
    fontWeight: "bold",
    marginTop: 12,
    color: Colors.TextInverse[1],
  },
  description: {
    fontSize: 12,
    color: "gray",
    marginBottom: 8,
  },
  errorText: {
    color: "red",
    marginTop: 8,
  },
  successText: {
    color: "green",
    marginTop: 8,
  },
});

//SESSIONS

//**
// currentSelectedPaybillsID = 2
//  */
