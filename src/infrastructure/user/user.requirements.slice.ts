import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { profileRequirements } from "./user.requirements.types";
import { UserRole } from "@/infrastructure/user/user.types";

type SectionKey = "PERSONAL_DETAILS" | "ACCOUNT_SECURITY" | "ADDITIONAL_INFO";

type ProfileCompletenessState = {
  missingFields: string[];
  sectionMissingCount: Record<SectionKey, number>;
  completionPercentage: number;
};

const initialState: ProfileCompletenessState = {
  missingFields: [],
  sectionMissingCount: {
    PERSONAL_DETAILS: 0,
    ACCOUNT_SECURITY: 0,
    ADDITIONAL_INFO: 0,
  },
  completionPercentage: 100,
};

export const profileCompletenessSlice = createSlice({
  name: "profileCompleteness",
  initialState,
  reducers: {
    computeProfileCompleteness: (
      state,
      action: PayloadAction<{
        role: UserRole;
        user: Record<string, any>;
      }>,
    ) => {
      const { role, user } = action.payload;
      const config = profileRequirements[role];

      const missing: string[] = [];
      const sectionCounts = {
        PERSONAL_DETAILS: 0,
        ACCOUNT_SECURITY: 0,
        ADDITIONAL_INFO: 0,
      };

      config.requiredFields.forEach((field) => {
        const value = user?.[field];

        const isEmpty = value === null || value === undefined || value === "";

        if (isEmpty) {
          missing.push(field);

          const section = config.fieldToSectionMap[field];
          if (section) {
            sectionCounts[section]++;
          }
        }
      });

      const total = config.requiredFields.length;
      const filled = total - missing.length;

      state.missingFields = missing;
      state.sectionMissingCount = sectionCounts;
      state.completionPercentage =
        total === 0 ? 100 : Math.round((filled / total) * 100);
    },

    resetProfileCompleteness: () => initialState,
  },
});

export const { computeProfileCompleteness, resetProfileCompleteness } =
  profileCompletenessSlice.actions;

export default profileCompletenessSlice.reducer;
