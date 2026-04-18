import { View, Text, StyleSheet, Alert } from "react-native";
import React from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { BorderRadius } from "@/constants";
import LegitmacyContsentComponent from "../../../components/ui/Policies/LegitmacyContsentComponent";
import { useGetVerificationStatusQuery } from "@/infrastructure/valid-docs/verification-document/verification-document.redux.api";
import {
  useGetOneQuery as useGetOneQueryOwner,
  usePatchMutation as usePatchMutationOwner,
} from "@/infrastructure/owner/owner.redux.api";
import {
  useGetOneQuery as useGetOneQueryTenant,
  usePatchMutation as usePatchMutationTenant,
} from "@/infrastructure/tenants/tenant.redux.api";
import { useDispatch } from "react-redux";
import { VerificationTypeMap } from "@/infrastructure/valid-docs/verification-document/verification-document.schema";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OwnerDashboardStackParamList } from "../../owner/screens/dashboard/navigation/dashboard.types";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import { getVerificationRole } from "./verificationConfig";
import { verificationConfig } from "./verificationConfig";
import { Lists } from "@/components/layout/Lists/Lists";
import VerificationStatusHeader from "./VerificationStatusHeaderComponent";
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
import { AppDispatch } from "@/application/store/stores";
import { refreshAccessStatusThunk } from "@/infrastructure/access/access.redux.thunk";

type VerificationMainNavigationProp =
  NativeStackNavigationProp<OwnerDashboardStackParamList>;

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export default function VerificationMainScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const { id: userId, role } = useDynamicUserApi();
  const userRole = getVerificationRole(role);
  const isTenant = role === "TENANT";

  const {
    data: userData,
    isLoading: isUserLoading,
    refetch: userRefetch,
    isFetching,
  } = isTenant ? useGetOneQueryTenant(userId!) : useGetOneQueryOwner(userId!);

  const { sourceTarget, verificationTypes } = verificationConfig[userRole];

  const {
    data: verificationStatusData,
    refetch: verificationStatusRefetch,
    isLoading: isLoadingVerification,
  } = useGetVerificationStatusQuery(
    { id: userId!, sourceTarget },
    { refetchOnFocus: true },
  );

  const [patchTenant] = usePatchMutationTenant();
  const [patchOwner] = usePatchMutationOwner();

  const [refreshing, setRefreshing] = React.useState(false);
  const [consentLoading, setConsentLoading] = React.useState(false);

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

  const triggerHaptic = (type: any = "impactLight") =>
    ReactNativeHapticFeedback.trigger(type, hapticOptions);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        userRefetch(),
        verificationStatusRefetch(),
        dispatch(refreshAccessStatusThunk({ userId: userId!, role })),
      ]);
      triggerHaptic("notificationSuccess");
    } finally {
      setRefreshing(false);
    }
  }, [userId, role, userRefetch, verificationStatusRefetch, dispatch]);

  const handleConsentChange = async (value: boolean) => {
    setConsentLoading(true);
    try {
      const patchData = {
        hasAcceptedPolicies: value,
        policiesAcceptedAt: new Date().toISOString(),
      };

      if (isTenant) await patchTenant({ id: userId, data: patchData }).unwrap();
      else await patchOwner({ id: userId, data: patchData }).unwrap();

      await onRefresh();
    } catch (err) {
      Alert.alert("Error", "Failed to save consent");
    } finally {
      setConsentLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const map: Record<string, { color: string; icon: string }> = {
      APPROVED: { color: "#80CFA9", icon: "check-decagram" }, // Changed from VERIFIED
      REJECTED: { color: theme.colors.error, icon: "alert-decagram" },
      PENDING: { color: "#FBBC05", icon: "clock-outline" }, // Matches your statusStylesConfig
      EXPIRED: { color: "#4285F4", icon: "history" }, // Added EXPIRED
      MISSING: { color: theme.colors.outline, icon: "plus-circle-outline" },
    };
    return map[status] || map.MISSING;
  };

  return (
    <StaticScreenWrapper
      variant="list"
      refreshing={refreshing || consentLoading}
      onRefresh={onRefresh}
      loading={isUserLoading && isLoadingVerification}
    >
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <VerificationStatusHeader
          verified={verificationStatusData?.verified}
          verificationList={verificationList}
          onCompleteProfile={() => navigation.navigate("ProfileEditScreen")}
        />

        <Text variant="labelLarge" style={s.sectionLabel}>
          REQUIRED DOCUMENTS
        </Text>

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

              // Logic: If it's not MISSING, we want to view it.
              // If it's REJECTED or MISSING, we want to submit/re-submit.
              const isActionableForSubmission =
                item.status === "MISSING" || item.status === "REJECTED";

              return (
                <React.Fragment key={item.type}>
                  <TouchableRipple
                    onPress={() => {
                      triggerHaptic();
                      const route = isActionableForSubmission
                        ? "VerificationSubmitScreen"
                        : "VerificationViewScreen";

                      const params = isActionableForSubmission
                        ? {
                            userId,
                            meta: { ...item.meta, type: item.type, role },
                          }
                        : {
                            userId,
                            docId: item.document!.id,
                            meta: { ...item.meta, type: item.type, role },
                          };

                      navigation.navigate(route, params);
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
                          name={info.icon as any}
                          size={24}
                          color={info.color}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text variant="titleMedium" style={s.itemTitle}>
                          {item.meta.displayName ?? item.type}
                        </Text>
                        {/* Status Text - Fixes underscore and displays clearly */}
                        <Text
                          variant="bodySmall"
                          style={{
                            color: info.color,
                            fontFamily: "Poppins-Medium",
                          }}
                        >
                          {item.status === "APPROVED"
                            ? "VERIFIED"
                            : item.status.replace("_", " ")}
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color={theme.colors.outline}
                      />
                    </View>
                  </TouchableRipple>
                  {!isLastItem && <Divider />}
                </React.Fragment>
              );
            }}
          />
        </Surface>

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
            role={isTenant ? "tenant" : "owner"}
            value={userData?.hasAcceptedPolicies ?? false}
            onChange={handleConsentChange}
          />
        </Surface>
      </ScrollView>

      {isFetching && (
        <View style={s.loaderOverlay}>
          <ActivityIndicator
            animating={true}
            color={theme.colors.primary}
            size="small"
          />
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
    borderRadius: BorderRadius.md,
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
    backgroundColor: "#F7F9FC",
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
