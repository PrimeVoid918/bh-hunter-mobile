import { UserRole } from "@/infrastructure/user/user.types";
import {
  VerificationDocumentMetaData,
  VerificationStatus,
  VerificationType,
  VerificationTypeMap,
} from "../../../infrastructure/valid-docs/verification-document/verification-document.schema";
export type verificationRole = "owners" | "tenants";

export type verificationRoleConfig = {
  sourceTarget: "owners" | "tenants";
  fileType: "pdf" | "image";
  verificationTypes: VerificationType[];
  submitScreen: string;
  viewScreen: string;
  supportsConsent: boolean;
};

export const verificationConfig: Record<
  verificationRole,
  verificationRoleConfig
> = {
  owners: {
    sourceTarget: "owners",
    fileType: "pdf",
    verificationTypes: [
      "BIR",
      "DTI",
      "FIRE_CERTIFICATE",
      "SANITARY_PERMIT",
      "SEC",
    ],
    submitScreen: "VerificationSubmitScreen",
    viewScreen: "VerificationViewScreen",
    supportsConsent: true,
  },

  tenants: {
    sourceTarget: "tenants",
    fileType: "image",
    verificationTypes: ["VALID_ID"],
    submitScreen: "VerificationSubmitScreen",
    viewScreen: "VerificationViewScreen",
    supportsConsent: false,
  },
};

export const statusStylesConfig: Record<
  VerificationStatus,
  { bg: string; icon: string }
> = {
  APPROVED: { bg: "#125e27", icon: "#34A853" },
  PENDING: { bg: "#6d5507", icon: "#FBBC05" },
  REJECTED: { bg: "#8a1609", icon: "#EA4335" },
  EXPIRED: { bg: "#063f8a", icon: "#4285F4" },
};

export type VerificationListItem = {
  type: VerificationType;
  meta: (typeof VerificationTypeMap)[VerificationType];
  status: VerificationStatus | "MISSING";
  document: VerificationDocumentMetaData | null;
};

export interface VerificationSubmitScreenMeta {
  role: "OWNER" | "TENANT" | "ADMIN" | "GUEST";
  type: VerificationType;
  displayName: string;
  description: string;
  applicableFor: string;
}

export const getVerificationRole = (
  role: "OWNER" | "TENANT" | "ADMIN" | "GUEST",
) => {
  return role === "OWNER"
    ? "owners"
    : role === "TENANT"
      ? "tenants"
      : (() => {
          throw new Error("Unsupported role for verification screen");
        })();
};
