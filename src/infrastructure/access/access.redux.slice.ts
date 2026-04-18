import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OwnerAccessStatus, TenantAccessStatus } from "./access.schema";



interface AccessState {
  status: TenantAccessStatus | OwnerAccessStatus | null;
  lastUpdated: string | null;
}

const initialState: AccessState = {
  status: null,
  lastUpdated: null,
};

export const accessSlice = createSlice({
  name: "access",
  initialState,
  reducers: {
    setAccessStatus: (
      state,
      action: PayloadAction<TenantAccessStatus | OwnerAccessStatus>,
    ) => {
      state.status = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    clearAccessStatus: (state) => {
      state.status = null;
      state.lastUpdated = null;
    },
  },
});

export const { setAccessStatus, clearAccessStatus } = accessSlice.actions;

export const selectAccessStatus = (state: any) => state.accessSlice.status;
export const selectIsVerified = (state: any) =>
  state.access.status?.verified ?? false;

export default accessSlice.reducer;
