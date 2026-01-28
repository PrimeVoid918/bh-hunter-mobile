import { VerificationType } from "@/infrastructure/valid-docs/verification-document/verification-document.schema";

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
};

export interface VerificationSubmitScreenMeta {
  type: VerificationType;
  displayName: string;
  description: string;
  applicableFor: string;
}

/**
 * {
 *  type: "BIR",
 *  meta: {
 *    displayName: "BIR Permit",
 *    description: "...",
 *    applicableFor: "All business types"
 *  },
 *  submitted: true,
 *  document: {
 *    id: 1,
 *    verificationType: "BIR",
 *    verificationStatus: "APPROVED",
 *    expiresAt: "...",
 *    fileFormat: "PDF"
 *  },
 *  status: "APPROVED" // or "PENDING" or "MISSING"
 *}
 */
