import React from "react";
import { View, StyleSheet, Alert, Pressable, ScrollView } from "react-native";
import {
  Text,
  Surface,
  useTheme,
  Divider,
  Button,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

// Hooks & Navigation
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OwnerDashboardStackParamList } from "../../owner/screens/dashboard/navigation/dashboard.types";

// Logic/Data Imports (Preserved)
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import Container from "@/components/layout/Container/Container";
import {
  useGetByIdQuery,
  usePatchVerificaitonDocumentMutation,
} from "@/infrastructure/valid-docs/verification-document/verification-document.redux.api";
import { getVerificationRole } from "./verificationConfig";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";

// Components
import PressableDocumentPicker from "@/components/ui/DocumentComponentUtilities/PressableDocumentPicker";
import PressableImagePicker from "@/components/ui/ImageComponentUtilities/PressableImagePicker";
import PressableDocumentFullscreen from "@/components/ui/DocumentComponentUtilities/PressableDocumentFullscreen";
import PressableImageFullscreen from "@/components/ui/ImageComponentUtilities/PressableImageFullscreen";
import { BorderRadius, Spacing } from "@/constants";

export default function VerificationViewScreen({ route }: any) {
  const theme = useTheme();
  const userId: number = route.params.userId;
  const docId: number = route.params.docId;
  const documentFormMeta = route.params.meta;
  const userRole = getVerificationRole(documentFormMeta.role);
  const navigate =
    useNavigation<NativeStackNavigationProp<OwnerDashboardStackParamList>>();

  const [refreshing, setRefreshing] = React.useState(false);
  const [pickedDocument, setPickedDocument] = React.useState<any>();
  const [pickedValidId, setPickedValidId] = React.useState<any>();
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

  const triggerHaptic = () => ReactNativeHapticFeedback.trigger("impactLight");

  // Logic Guards (Preserved)
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await documentRefetch();
    setRefreshing(false);
  };

  const getStatusColor = () => {
    if (isRejected) return theme.colors.error;
    if (status === "VERIFIED") return "#80CFA9";
    return theme.colors.secondary;
  };

  const getFileName = (url?: string) => {
    const urlParts = url?.split("/");
    return decodeURIComponent(urlParts?.pop() || "Unnamed File");
  };

  return (
    <StaticScreenWrapper
      refreshing={refreshing}
      onRefresh={handleRefresh}
      style={{ backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={s.content}>
        {/* Status Header */}
        <Surface
          elevation={0}
          style={[s.statusCard, { borderColor: getStatusColor() }]}
        >
          <View style={s.row}>
            <MaterialCommunityIcons
              name={isRejected ? "alert-circle" : "information-outline"}
              size={24}
              color={getStatusColor()}
            />
            <View style={{ marginLeft: 12 }}>
              <Text variant="labelLarge" style={{ color: getStatusColor() }}>
                STATUS
              </Text>
              <Text variant="headlineSmall" style={s.statusText}>
                {status}
              </Text>
            </View>
          </View>
          {isRejected && (
            <View style={s.rejectionBox}>
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.error,
                  fontFamily: "Poppins-Medium",
                }}
              >
                Reason: {documentData.rejectionReason ?? "No reason provided."}
              </Text>
            </View>
          )}
        </Surface>

        {/* Document Details Section */}
        <Text variant="labelLarge" style={s.sectionTitle}>
          DOCUMENT DETAILS
        </Text>
        <Surface elevation={0} style={s.infoCard}>
          <DetailItem
            label="Document Name"
            value={getFileName(documentData.url)}
            icon="file-document-outline"
          />
          <Divider />
          <DetailItem
            label="Type"
            value={documentData.verificationType}
            icon="tag-outline"
          />
          <Divider />
          <DetailItem
            label="Format"
            value={fileFormat}
            icon="file-cog-outline"
          />
          <Divider />

          <View style={s.detailRow}>
            <View style={s.iconWrapper}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="labelSmall" style={s.detailLabel}>
                Expiration Date
              </Text>
              {canResubmit ? (
                <Pressable
                  onPress={() => {
                    triggerHaptic();
                    setShowDatePicker(true);
                  }}
                  style={[
                    s.dateSelector,
                    { borderColor: theme.colors.outlineVariant },
                  ]}
                >
                  <Text variant="bodyLarge">
                    {pickDate ? pickDate.toDateString() : "Select Date..."}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} />
                </Pressable>
              ) : (
                <Text variant="bodyLarge" style={s.detailValue}>
                  {documentData.expiresAt ?? "N/A"}
                </Text>
              )}
            </View>
          </View>
        </Surface>

        {/* Preview/Upload Section */}
        <Text variant="labelLarge" style={[s.sectionTitle, { marginTop: 24 }]}>
          {canResubmit ? "UPLOAD NEW DOCUMENT" : "FILE PREVIEW"}
        </Text>

        <View style={s.uploadContainer}>
          {canResubmit ? (
            fileFormat === "PDF" ? (
              <PressableDocumentPicker
                pickDocument={setPickedDocument}
                removeDocument={() => setPickedDocument(undefined)}
              />
            ) : (
              <PressableImagePicker
                pickImage={setPickedValidId}
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
              containerStyle={s.imagePreview}
            />
          )}
        </View>

        {/* Action Button */}
        {canResubmit && (
          <Button
            mode="contained"
            loading={isPatching}
            disabled={isPatching}
            onPress={() => {
              triggerHaptic(); /* handleSubmit logic */
            }}
            style={s.submitBtn}
            contentStyle={{ height: 50 }}
            labelStyle={{ fontFamily: "Poppins-SemiBold" }}
          >
            {isPatching ? "Updating..." : "Resubmit for Verification"}
          </Button>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={pickDate ?? new Date()}
            mode="date"
            onChange={(e, d) => {
              setShowDatePicker(false);
              if (d) setPickDate(d);
            }}
          />
        )}
      </ScrollView>
    </StaticScreenWrapper>
  );
}

// Sub-component for clean rendering
const DetailItem = ({ label, value, icon }: any) => {
  const theme = useTheme();
  return (
    <View style={s.detailRow}>
      <View style={s.iconWrapper}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={theme.colors.primary}
        />
      </View>
      <View>
        <Text variant="labelSmall" style={s.detailLabel}>
          {label}
        </Text>
        <Text variant="bodyLarge" style={s.detailValue}>
          {value}
        </Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  content: {},
  statusCard: {
    padding: 16,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    backgroundColor: "#FFF",
    marginBottom: 24,
  },
  row: { flexDirection: "row", alignItems: "center" },
  statusText: { fontFamily: "Poppins-Bold", letterSpacing: 1 },
  rejectionBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FFF5F5",
    borderRadius: BorderRadius.md,
  },
  sectionTitle: {
    marginLeft: 4,
    marginBottom: 8,
    opacity: 0.7,
    fontFamily: "Poppins-Medium",
  },
  infoCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFF",
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailLabel: { opacity: 0.6, fontFamily: "Poppins-Regular" },
  detailValue: { fontFamily: "Poppins-Medium" },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  uploadContainer: { marginTop: 8 },
  imagePreview: {
    aspectRatio: 1.6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#CCC",
  },
  submitBtn: {
    marginTop: 32,
    borderRadius: BorderRadius.md,
  },
});
