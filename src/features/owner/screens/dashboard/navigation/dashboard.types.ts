import { VerificationSubmitScreenMeta } from "@/features/shared/verification/verificationConfig";

export type OwnerDashboardStackParamList = {
  DashboardScreen: undefined;

  VerificationMainScreen: undefined;
  VerificationSubmitScreen: {
    userId: number;
    meta: VerificationSubmitScreenMeta;
  };
  VerificationViewScreen: {
    userId: number;
    docId: number;
    meta: VerificationSubmitScreenMeta;
  };
  ProfileEditScreen: undefined;
};
