import { createAsyncThunk } from "@reduxjs/toolkit";
import { accessApi } from "./access.redux.api";
import { setAccessStatus } from "./access.redux.slice";

export const refreshAccessStatusThunk = createAsyncThunk(
  "access/refreshStatus",
  async ({ userId, role }: { userId: number; role: string }, { dispatch }) => {
    const endpoint =
      role === "TENANT"
        ? accessApi.endpoints.getTenantAccess
        : accessApi.endpoints.getOwnerAccess;

    const result = await dispatch(endpoint.initiate({ id: userId })).unwrap();

    dispatch(setAccessStatus(result));

    return result;
  },
);
