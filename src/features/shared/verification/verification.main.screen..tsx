import { View, Text, StyleSheet, Alert } from "react-native";
import React from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { VStack, Button } from "@gluestack-ui/themed";
import { Colors, BorderRadius, GlobalStyle, Spacing } from "@/constants";
import LegitmacyContsentComponent from "../../../components/ui/TermsAndConditionsModals/LegitmacyContsentComponent";
import { useGetVerificationStatusQuery } from "@/infrastructure/valid-docs/verification-document/verification-document.redux.api";
import {
  useGetOneQuery as useGetOneQueryOwner,
  usePatchMutation as usePatchMutationOwner,
} from "@/infrastructure/owner/owner.redux.api";
import {
  useGetOneQuery as useGetOneQueryTenant,
  usePatchMutation as usePatchMutationTenant,
} from "@/infrastructure/tenants/tenant.redux.api";
import { useSelector } from "react-redux";
import { RootState } from "@/application/store/stores";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  VerificationDocumentMetaData,
  VerificationStatus,
  VerificationTypeMap,
} from "@/infrastructure/valid-docs/verification-document/verification-document.schema";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OwnerDashboardStackParamList } from "../../owner/screens/dashboard/navigation/dashboard.types";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";
import { TenantDashboardStackParamList } from "@/features/tenant/screens/dashboard/navigation/dashboard.stack";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { VerificationType } from "../../../infrastructure/valid-docs/verification-document/verification-document.schema";
import { getVerificationRole, userRole } from "./verificationConfig";
import {
  statusStylesConfig,
  verificationConfig,
  VerificationListItem,
  verificationRole,
} from "./verificationConfig";
import { Lists } from "@/components/layout/Lists/Lists";
import VerificationCardComponent from "./VerificationCardComponent";
import VerificationStatusHeader from "./VerificationStatusHeaderComponent";
import { MenuStackParamList } from "../menu/navigation/menu.stack.types";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import {
  ActivityIndicator,
  Divider,
  Surface,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type VerificationMainNavigationProp =
  NativeStackNavigationProp<OwnerDashboardStackParamList>;
// type RootStackParamList = {
//   DashboardStack: undefined;
//   MenuStack: undefined;
// };

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export default function VerificationMainScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { id: userId, role } = useDynamicUserApi();
  const userRole = getVerificationRole(role);
  const isTenant = role === "TENANT";

  const triggerHaptic = () =>
    ReactNativeHapticFeedback.trigger("impactLight", hapticOptions);

  // Queries (Preserved logic)
  const {
    data: userData,
    isLoading: isUserLoading,
    isError,
    refetch: userRefetch,
    isFetching,
  } = isTenant ? useGetOneQueryTenant(userId!) : useGetOneQueryOwner(userId!);

  const { sourceTarget, verificationTypes } = verificationConfig[userRole];
  const {
    data: verificationStatusData,
    refetch: verificationStatusRefetch,
    isLoading: isLoadingVerification,
    isError: isErrorVerification,
  } = useGetVerificationStatusQuery(
    { id: userId!, sourceTarget },
    { refetchOnFocus: true },
  );

  const [patchTenant] = usePatchMutationTenant();
  const [patchOwner] = usePatchMutationOwner();

  useFocusEffect(
    React.useCallback(() => {
      userRefetch();
      verificationStatusRefetch();
    }, [userId, userRefetch, verificationStatusRefetch]),
  );

  const verificationList = React.useMemo(() => {
    const submittedDocsMap = Object.fromEntries(
      (verificationStatusData?.verificationDocuments ?? []).map((doc) => [
        doc.verificationType,
        doc,
      ]),
    );
    return verificationTypes.map((type) => {
      const submitted = submittedDocsMap[type] ?? null;
      return {
        type,
        meta: VerificationTypeMap[type],
        status: submitted?.verificationStatus ?? "MISSING",
        document: submitted,
      };
    });
  }, [verificationTypes, verificationStatusData]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return { color: "#80CFA9", icon: "check-decagram" };
      case "REJECTED":
        return { color: theme.colors.error, icon: "alert-decagram" };
      case "PENDING":
        return { color: theme.colors.secondary, icon: "clock-outline" };
      default:
        return { color: theme.colors.outline, icon: "plus-circle-outline" };
    }
  };

  const handleConsentChange = async (value: boolean) => {
    try {
      if (isTenant) {
        await patchTenant({
          id: userId,
          data: {
            hasAcceptedLegitimacyConsent: value,
            consentAcceptedAt: new Date().toISOString(),
          },
        }).unwrap();
      } else {
        await patchOwner({
          id: userId,
          data: {
            hasAcceptedLegitimacyConsent: value,
            consentAcceptedAt: new Date().toISOString(),
          },
        }).unwrap();
      }
      userRefetch();
    } catch (err) {
      Alert.alert("Error", "Failed to save consent");
    }
  };

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    userRefetch();
    verificationStatusRefetch();
    setTimeout(() => setRefreshing(false), 1000);
  }, [userRefetch, verificationStatusRefetch]);

  return (
    <StaticScreenWrapper
      variant="list"
      refreshing={refreshing}
      onRefresh={onRefresh}
      loading={isUserLoading && isLoadingVerification}
      error={[isError && isErrorVerification ? "" : null]}
    >
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <VerificationStatusHeader
          verified={verificationStatusData?.verified}
          verificationList={verificationList}
          onCompleteProfile={() => navigation.navigate("ProfileEditScreen")}
        />

        <Text variant="labelLarge" style={s.sectionLabel}>
          REQUIRED DOCUMENTS
        </Text>

        {/* Document List Container */}
        <Surface
          elevation={0}
          style={[
            s.listContainer,
            { borderColor: theme.colors.outlineVariant },
          ]}
        >
          <Lists
            list={verificationList}
            contentContainerStyle={{ width: "100%" }}
            renderItem={({ item, index }) => {
              const info = getStatusInfo(item.status);
              const isLastItem = index === verificationList.length - 1;

              return (
                <React.Fragment>
                  <TouchableRipple
                    onPress={() => {
                      triggerHaptic();
                      if (
                        item.status === "MISSING" ||
                        item.status === "REJECTED"
                      ) {
                        navigation.navigate("VerificationSubmitScreen", {
                          userId,
                          meta: { ...item.meta, type: item.type, role },
                        });
                      } else {
                        navigation.navigate("VerificationViewScreen", {
                          userId,
                          docId: item.document!.id,
                          meta: { ...item.meta, type: item.type, role },
                        });
                      }
                    }}
                    style={s.listItem}
                  >
                    <View style={s.itemContent}>
                      <View
                        style={[
                          s.iconBg,
                          { backgroundColor: info.color + "15" },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={info.icon}
                          size={24}
                          color={info.color}
                        />
                      </View>

                      <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text variant="titleMedium" style={s.itemTitle}>
                          {item.meta.displayName ?? item.type}
                        </Text>
                        <Text
                          variant="bodySmall"
                          style={{
                            color: info.color,
                            fontFamily: "Poppins-Medium",
                          }}
                        >
                          {item.status.replace("_", " ")}
                        </Text>
                      </View>

                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color={theme.colors.outline}
                      />
                    </View>
                  </TouchableRipple>

                  {!isLastItem && (
                    <Divider horizontalInset={false} style={{ height: 1 }} />
                  )}
                </React.Fragment>
              );
            }}
          />
        </Surface>

        {/* Consent Section */}
        <Surface
          elevation={0}
          style={[s.consentCard, { borderColor: theme.colors.outlineVariant }]}
        >
          <View style={s.consentHeader}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text
              variant="labelLarge"
              style={{ marginLeft: 8, color: theme.colors.primary }}
            >
              LEGAL CONSENT
            </Text>
          </View>
          <LegitmacyContsentComponent
            value={userData?.hasAcceptedLegitimacyConsent ?? false}
            onChange={(val: boolean) => {
              triggerHaptic();
              handleConsentChange(val);
            }}
          />
        </Surface>
      </ScrollView>

      {isFetching && (
        <View style={s.loaderOverlay}>
          <ActivityIndicator animating={true} color={theme.colors.primary} />
        </View>
      )}
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  scrollContent: {},
  sectionLabel: {
    marginLeft: 4,
    marginBottom: 12,
    opacity: 0.7,
    fontFamily: "Poppins-Medium",
  },
  listContainer: {
    borderRadius: BorderRadius.md, // xl radius
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    marginBottom: 24,
  },
  listItem: {
    padding: 16,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  itemTitle: {
    fontFamily: "Poppins-SemiBold",
  },
  consentCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#F7F9FC", // Slightly different bg to distinguish it
  },
  consentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  loaderOverlay: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#EEE",
  },
});
