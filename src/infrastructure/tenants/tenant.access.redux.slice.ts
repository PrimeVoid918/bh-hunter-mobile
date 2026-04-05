import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TenantAccessStatus } from "./tenant.types";

type TenantAccessState = {
  status: TenantAccessStatus | null;
};

const initialState: TenantAccessState = {
  status: null,
};

export const tenantAccessSlice = createSlice({
  name: "tenantAccess",
  initialState,
  reducers: {
    setAccessStatus(state, action: PayloadAction<TenantAccessStatus>) {
      state.status = action.payload;
    },

    clearAccessStatus(state) {
      state.status = null;
    },
  },
});

export const { setAccessStatus, clearAccessStatus } = tenantAccessSlice.actions;

export default tenantAccessSlice.reducer;

//* usage
/*
  const access = useSelector((state) => state.tenantAccess.status);

  if (!access?.isVerified) {
    navigation.navigate("VerificationScreen");
  }

  <Button disabled={!access?.canBookRoom}>
    Book Room
  </Button>
*/
