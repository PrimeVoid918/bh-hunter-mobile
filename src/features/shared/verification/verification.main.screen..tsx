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

type VerificationMainNavigationProp = NativeStackNavigationProp<
  OwnerDashboardStackParamList,
  "VerificationMainScreen"
>;

export default function VerificationMainScreen() {
  const navigation = useNavigation<VerificationMainNavigationProp>();

  const { id, role } = useDynamicUserApi();
  const userRole = getVerificationRole(role);

  const userId = id;

  const isTenant = role === "TENANT";
  const isOwner = role === "OWNER";

  if (!userId) {
    Alert.alert("Error", "User not found");
    return null;
  }

  // User PROFILE QUERY WITH FULL DEBUG LOGS
  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    refetch: userRefetch,
    isFetching,
  } = isTenant ? useGetOneQueryTenant(userId) : useGetOneQueryOwner(userId); // owner hook
  const { sourceTarget, verificationTypes } = verificationConfig[userRole];

  // VERIFICATION STATUS QUERY
  const {
    data: verificationStatusData,
    isLoading: verificationStatusLoading,
    isError: verificationStatusError,
    refetch: verificationStatusRefetch,
  } = useGetVerificationStatusQuery(
    { id: userId, sourceTarget: sourceTarget },
    { refetchOnMountOrArgChange: true, refetchOnFocus: true },
  );

  const [patchTenant] = usePatchMutationTenant();
  const [patchOwner] = usePatchMutationOwner();

  // THIS IS THE VALUE YOU CARE ABOUT
  const hasAcceptedLegitimacyConsent =
    userData?.hasAcceptedLegitimacyConsent ?? false;

  // LOG EVERYTHING — YOU WILL SEE THIS IN CONSOLE
  // React.useEffect(() => {
  // }, [userData]);

  // Log when refetch happens
  useFocusEffect(
    React.useCallback(() => {
      // console.log("Screen focused → forcing refetch for ownerId:", ownerId);
      userRefetch();
      verificationStatusRefetch();
    }, [userId, userRefetch, verificationStatusRefetch]),
  );

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

  const onRefresh = React.useCallback(() => {
    userRefetch();
    verificationStatusRefetch();
  }, [userRefetch, verificationStatusRefetch]);

  const verificationList = React.useMemo<VerificationListItem[]>(() => {
    const submittedDocsMap = Object.fromEntries(
      (verificationStatusData?.verificationDocuments ?? []).map((doc) => [
        doc.verificationType,
        doc,
      ]),
    ) as Record<VerificationType, VerificationDocumentMetaData>;

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


  return (
    <StaticScreenWrapper
      refreshing={isFetching}
      onRefresh={onRefresh}
      style={[GlobalStyle.GlobalsContainer, s.container]}
      contentContainerStyle={[
        GlobalStyle.GlobalsContentContainer,
        s.containerStyle,
      ]}
    >
      {isUserLoading ||
        (verificationStatusLoading && <FullScreenLoaderAnimated />)}
      {isUserError ||
        (verificationStatusError && (
          <FullScreenErrorModal message="Failed to load data" />
        ))}
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: Spacing.lg,
        }}
      >
        <Ionicons
          name={
            verificationStatusData?.verified
              ? "checkmark-circle"
              : "close-circle"
          }
          color={verificationStatusData?.verified ? "#34A853" : "red"}
          size={65}
        />
        <Text style={{ color: "white", fontSize: 43 }}>
          {verificationStatusData?.verified ? "Verified" : "Not Verified"}
        </Text>
      </View>

      <VStack style={s.cardHolder}>
        {verificationList.map((doc, index) => {
          const status = doc.status;
          const colors = statusStylesConfig[status] ?? {
            bg: "#666",
            icon: "#999",
          };

          return (
            <View
              key={index}
              style={[s.cardContainer, { backgroundColor: colors.bg }]}
            >
              <Ionicons
                name={
                  status === "APPROVED"
                    ? "checkmark-circle"
                    : status === "REJECTED"
                      ? "close-circle"
                      : "time"
                }
                color={colors.icon}
                size={50}
              />
              <View>
                <Text style={s.cardText}>{doc.type}</Text>
                <Text style={s.cardTextSub}>{status}</Text>
              </View>
              <Button
                style={s.cardCta}
                onPress={() => {
                  if (status === "MISSING") {
                    navigation.navigate("VerificationSubmitScreen", {
                      userId,
                      meta: { ...doc.meta, type: doc.type, role: role },
                    });
                  } else {
                    navigation.navigate("VerificationViewScreen", {
                      userId,
                      docId: doc.document!.id,
                      meta: { ...doc.meta, type: doc.type, role: role },
                    });
                  }
                }}
              >
                <Text style={{ color: "white" }}>
                  {status === "MISSING" ? "Submit" : "View"}
                </Text>
              </Button>
            </View>
          );
        })}
      </VStack>

      {/* THIS IS WHERE THE TRUTH IS REVEALED */}
      <VStack style={{ marginTop: "auto", padding: Spacing.lg }}>
        {/* <Text
          style={{
            color: "yellow",
            fontSize: 14,
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          DEBUG: Consent = {String(hasAcceptedLegitimacyConsent)} (from backend)
        </Text> */}

        <LegitmacyContsentComponent
          value={hasAcceptedLegitimacyConsent}
          onChange={handleConsentChange}
        />
      </VStack>

      {isFetching && !isUserLoading && <FullScreenLoaderAnimated />}
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: { flexDirection: "column" },
  containerStyle: { flexGrow: 1, padding: Spacing.lg, alignItems: "center" },
  cardHolder: { gap: Spacing.md, width: "100%" },
  cardContainer: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  cardCta: { marginLeft: "auto" },
  cardText: { color: Colors.TextInverse[1], fontSize: 16, fontWeight: "600" },
  cardTextSub: { color: Colors.TextInverse[1], fontSize: 12, opacity: 0.8 },
});
