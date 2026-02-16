import { VerificationSubmitScreenMeta } from "@/features/shared/verification/verificationConfig";

export type OwnerDashboardStackParamList = {
  DashboardScreen: undefined;
  BoardingHouseDetailsScreen: {
    id: number | null;
    fromMaps?: boolean;
    [key: string]: any; // allow extra params if needed
  };
  RoomsListMainScreen: {
    paramsId: number;
  };
  RoomsDetailsScreen: {
    boardingHouseId: number | undefined;
    roomId: number | undefined;
    fromMaps?: boolean;
    [key: string]: any; // allow extra params if needed
  };
  RoomsAddScreen: {
    bhId: number;
  };
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
