import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import React from "react";
import { OwnerDashboardStackParamList } from "../../owner/screens/dashboard/navigation/dashboard.types";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import {
  BorderRadius,
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
} from "@/constants";
import {
  useGetByIdQuery,
  usePatchVerificaitonDocumentMutation,
} from "@/infrastructure/valid-docs/verification-document/verification-document.redux.api";
import { Button, VStack } from "@gluestack-ui/themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { AppDocumentFile } from "@/infrastructure/document/document.schema";
import PressableDocumentPicker from "@/components/ui/DocumentComponentUtilities/PressableDocumentPicker";
import { useDecisionModal } from "@/components/ui/FullScreenDecisionModal";
import PressableDocumentFullscreen from "@/components/ui/DocumentComponentUtilities/PressableDocumentFullscreen";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import PressableImagePicker from "@/components/ui/ImageComponentUtilities/PressableImagePicker";
import { AppImageFile } from "@/infrastructure/image/image.schema";
import {
  getVerificationRole,
  VerificationSubmitScreenMeta,
} from "./verificationConfig";
import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";
import Container from "@/components/layout/Container/Container";

export default function VerificationViewScreen({ route }) {
  const userId: number = route.params.userId;
  const docId: number = route.params.docId;
  const documentFormMeta: VerificationSubmitScreenMeta = route.params.meta;

  const userRole = getVerificationRole(documentFormMeta.role);

  const navigate =
    useNavigation<NativeStackNavigationProp<OwnerDashboardStackParamList>>();

  const { showModal } = useDecisionModal();

  const [refreshing, setRefreshing] = React.useState(false);
  const [pickedDocument, setPickedDocument] = React.useState<AppDocumentFile>();
  const [pickedValidId, setPickedValidId] = React.useState<AppImageFile>();
  const handlePickThumbnailImage = React.useCallback((image: AppImageFile) => {
    console.log("documnet", image);
    setPickedValidId(image);
  }, []);
  const [showPicker, setShowPicker] = React.useState(false);

  const [pickDate, setPickDate] = React.useState<Date>();
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const {
    data: documentData,
    isLoading: isDocumentLoading,
    isError: isDocumentError,
    refetch: documentRefetch,
  } = useGetByIdQuery({ id: docId, sourceTarget: userRole });

  const [patchDocument, { isLoading: isPatching }] =
    usePatchVerificaitonDocumentMutation();

  // Early returns for user missing / error / loading

  if (!userId) {
    navigate.goBack();
    return <FullScreenErrorModal message="User Not Found!" />;
  }

  if (isDocumentError)
    return <FullScreenErrorModal message="Error loading document." />;

  if (isDocumentLoading || !documentData) return <FullScreenLoaderAnimated />;

  const status = documentData.verificationStatus ?? "MISSING";
  const fileFormat = documentData.fileFormat ?? "PDF";
  const isRejected = status === "REJECTED";
  const canResubmit = isRejected || status === "MISSING";

  // React.useEffect(() => {
  //   console.log("Fullscreen image prop:", documentData.url);
  // }, [documentData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await documentRefetch();
    setRefreshing(false);
  };

  const handleSubmitPatchedDocument = async () => {
    if (fileFormat === "PDF" && !pickedDocument) {
      return Alert.alert("Missing File", "Please pick a document.");
    }

    if (fileFormat === "IMAGE" && !pickedValidId) {
      return Alert.alert("Missing Image", "Please pick an image.");
    }

    if (!pickDate) {
      return Alert.alert("Missing Expiration Date", "Please select a date.");
    }

    const file =
      fileFormat === "PDF"
        ? (pickedDocument as AppDocumentFile)
        : (pickedValidId as AppImageFile);

    showModal({
      title: "Resubmit Document",
      message: "Are you sure you want to resubmit this document?",
      onConfirm: async () => {
        try {
          console.log("Patching document…");

          const result = await patchDocument({
            id: docId,
            file,
            data: { expiresAt: pickDate.toISOString() },
            sourceTarget: userRole,
          }).unwrap();

          console.log("PATCH SUCCESS:", result);
          Alert.alert("Success", "Document resubmitted successfully");
        } catch (err: any) {
          console.log("PATCH ERROR:", err);

          const message = Array.isArray(err?.data?.message)
            ? err.data.message.join("\n")
            : err?.data?.message || "Failed to resubmit document";

          Alert.alert("Error", message);
        }
      },
    });
  };

  const getFileName = (url?: string) => {
    const urlParts = url?.split("/");
    return decodeURIComponent(urlParts?.pop() || "");
  };

  // console.log("url: ", documentData.url);
  // const normalizedUrl = documentData.url.replace(/([^:]\/)\/+/g, "$1");
  // console.log("url: ", normalizedUrl.url);

  return (
    <StaticScreenWrapper
      style={GlobalStyle.GlobalsContainer}
      contentContainerStyle={GlobalStyle.GlobalsContentContainer}
      wrapInScrollView={false}
    >
      <Container refreshing={refreshing} onRefresh={handleRefresh}>
        {isDocumentLoading && <FullScreenLoaderAnimated />}
        {isDocumentError && (
          <FullScreenErrorModal message="Failed to load data" />
        )}

        <VStack style={[GlobalStyle.GlobalsContainer, s.container]}>
          <Text style={[s.label, s.textColor]}>Document Name:</Text>
          <Text style={[s.textColor, { fontSize: Fontsize.xl }]}>
            {getFileName(documentData.url)}
          </Text>
          <View style={s.borderLine} />

          <Text style={[s.label, s.textColor]}>Type:</Text>
          <Text style={s.textColor}>{documentData.verificationType}</Text>

          <Text style={[s.label, s.textColor]}>File Format:</Text>
          <Text style={s.textColor}>{fileFormat}</Text>
          <View style={s.borderLine} />

          <Text style={[s.label, s.textColor]}>Expiration Date:</Text>

          {canResubmit ? (
            <>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 6,
                  marginTop: 8,
                  borderColor: Colors.PrimaryLight[9],
                }}
              >
                <Text style={s.textColor}>
                  {pickDate
                    ? pickDate.toDateString()
                    : "Select expiration date"}
                </Text>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={pickDate ?? new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (event.type === "set" && date) {
                      setPickDate(date);
                    }
                  }}
                />
              )}
            </>
          ) : (
            <>
              <Text style={s.textColor}>{documentData.expiresAt ?? "N/A"}</Text>
              <View style={s.borderLine} />
            </>
          )}

          <Text style={[s.label, s.textColor]}>Status:</Text>
          <Text style={s.textColor}>{status}</Text>
          <View style={s.borderLine} />

          {isRejected && (
            <View style={{ marginTop: 12 }}>
              <Text style={[s.label, { color: "red", fontSize: 18 }]}>
                This document was rejected.
              </Text>
              <Text style={[s.textColor]}>
                Reject Reason: {documentData.rejectionReason ?? "No Reason"}
              </Text>
            </View>
          )}

          {/* FILE SECTION */}
          {canResubmit ? (
            fileFormat === "PDF" ? (
              <PressableDocumentPicker
                pickDocument={setPickedDocument}
                removeDocument={() => setPickedDocument(undefined)}
              />
            ) : (
              <PressableImagePicker
                pickImage={handlePickThumbnailImage}
                removeImage={() => setPickedValidId(undefined)}
              />
            )
          ) : fileFormat === "PDF" ? (
            <PressableDocumentFullscreen document={documentData?.url} />
          ) : (
            <PressableImageFullscreen
              image={{
                url: documentData?.url!,
                name: "document",
                type: "image",
                uri: documentData?.url!,
              }}
              imageStyleConfig={
                {
                  // resizeMode: "cover",
                }
              }
              containerStyle={{
                aspectRatio: 2,
                borderWidth: 2,
              }}
            />
          )}

          {/* Button section */}
          {canResubmit && (
            <Button
              isDisabled={isPatching}
              onPress={handleSubmitPatchedDocument}
            >
              <Text style={{ color: "white" }}>
                {isPatching ? "Submitting..." : "Resubmit Document"}
              </Text>
            </Button>
          )}
        </VStack>
      </Container>
    </StaticScreenWrapper>
  );
}
const s = StyleSheet.create({
  mainContainer: {},
  containerStyle: {},
  container: { flex: 1, padding: Spacing.md, gap: Spacing.md },
  textColor: { color: Colors.TextInverse[2] },
  label: {
    fontWeight: "bold",
    marginTop: 12,
    color: Colors.TextInverse[1],
  },
  borderLine: {
    borderWidth: 2,
    borderColor: Colors.PrimaryLight[9],
    marginTop: 12,
  },
  datePicker: { padding: 12, borderWidth: 1, borderRadius: 6, marginTop: 8 },
});
