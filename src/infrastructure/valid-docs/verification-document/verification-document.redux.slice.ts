import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { VerificationDocumentStatus } from "./verification-document.schema";

type VerificationUXState = {
  isProfileComplete: boolean;
  isFullyVerified: boolean;
  hasPending: boolean;
  hasRejected: boolean;
  missingRequirements: string[];
  nextStep:
    | "COMPLETE_PROFILE"
    | "UPLOAD_DOCUMENTS"
    | "WAITING_APPROVAL"
    | "VERIFIED"
    | null;
};

const initialState: VerificationUXState = {
  isProfileComplete: false,
  isFullyVerified: false,
  hasPending: false,
  hasRejected: false,
  missingRequirements: [],
  nextStep: null,
};

export const verificationSlice = createSlice({
  name: "verification",
  initialState,
  reducers: {
    computeVerificationState: (
      state,
      action: PayloadAction<{
        profile: { firstName?: string | null; lastName?: string | null };
        verificationStatus: VerificationDocumentStatus;
      }>,
    ) => {
      const { profile, verificationStatus } = action.payload;

      const isProfileComplete = !!profile.firstName && !!profile.lastName;

      state.isProfileComplete = isProfileComplete;

      const docs = verificationStatus.verificationDocuments ?? [];

      state.hasPending = docs.some((d) => d.verificationStatus === "PENDING");

      state.hasRejected = docs.some((d) => d.verificationStatus === "REJECTED");

      state.isFullyVerified = verificationStatus.verified;

      const missing: string[] = [];

      if (!isProfileComplete) missing.push("PROFILE");

      if (!verificationStatus.verified) {
        if (docs.length === 0) missing.push("DOCUMENTS");
      }

      state.missingRequirements = missing;

      if (!isProfileComplete) {
        state.nextStep = "COMPLETE_PROFILE";
      } else if (state.hasRejected) {
        state.nextStep = "UPLOAD_DOCUMENTS";
      } else if (state.hasPending) {
        state.nextStep = "WAITING_APPROVAL";
      } else if (state.isFullyVerified) {
        state.nextStep = "VERIFIED";
      } else {
        state.nextStep = "UPLOAD_DOCUMENTS";
      }
    },

    resetVerificationState: () => initialState,
  },
});

export const { computeVerificationState, resetVerificationState } =
  verificationSlice.actions;

export default verificationSlice.reducer;
