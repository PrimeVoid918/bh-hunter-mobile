import { UserRole } from "@/infrastructure/user/user.types";

type FieldKey = string;

type SectionKey = "PERSONAL_DETAILS" | "ACCOUNT_SECURITY" | "ADDITIONAL_INFO";

type RequirementConfig = {
  requiredFields: FieldKey[];
  fieldToSectionMap: Record<FieldKey, SectionKey>;
};

export const profileRequirements: Record<UserRole, RequirementConfig> = {
  TENANT: {
    requiredFields: ["firstname", "lastname", "phone_number", "address"],
    fieldToSectionMap: {
      firstname: "PERSONAL_DETAILS",
      lastname: "PERSONAL_DETAILS",
      phone_number: "ACCOUNT_SECURITY",
      address: "ADDITIONAL_INFO",
      age: "ADDITIONAL_INFO",
      guardian: "ADDITIONAL_INFO",
    },
  },

  OWNER: {
    requiredFields: ["firstname", "lastname", "phone_number", "address"],
    fieldToSectionMap: {
      firstname: "PERSONAL_DETAILS",
      lastname: "PERSONAL_DETAILS",
      phone_number: "ACCOUNT_SECURITY",
      address: "ADDITIONAL_INFO",
      age: "ADDITIONAL_INFO",
    },
  },

  ADMIN: {
    requiredFields: ["firstname", "lastname"],
    fieldToSectionMap: {
      firstname: "PERSONAL_DETAILS",
      lastname: "PERSONAL_DETAILS",
    },
  },

  GUEST: {
    requiredFields: [],
    fieldToSectionMap: {},
  },
};
