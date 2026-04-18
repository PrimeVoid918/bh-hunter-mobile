import { configureStore } from "@reduxjs/toolkit";
import boardingHouseSlice from "@/infrastructure/boarding-houses/boarding-house.redux.slice";
import { boardingHouseApi } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import authSlice from "@/infrastructure/auth/auth.redux.slice";
import { authApi } from "@/infrastructure/auth/auth.redux.api";
import adminSlice, { adminApi } from "@/infrastructure/admin/admin.redux.slice";

import ownerReducer from "@/infrastructure/owner/owner.redux.slice";
import { ownerApi } from "@/infrastructure/owner/owner.redux.api";
import tenantReducer from "@/infrastructure/tenants/tenant.redux.slice";
import { tenantApi } from "@/infrastructure/tenants/tenant.redux.api";

import { roomApi } from "@/infrastructure/room/rooms.redux.api";
import genericSearchBarSlice from "../../infrastructure/redux-utils/genericSearchBar.slice";
import { bookingApi } from "@/infrastructure/booking/booking.redux.api";
import { verificationDocumentsApi } from "@/infrastructure/valid-docs/verification-document/verification-document.redux.api";
import { bHAndRoomShareApi } from "@/infrastructure/shared/redux.api";
import { reviewsApi } from "@/infrastructure/reviews/reviews.redux.api";
import { notificationApi } from "@/infrastructure/notifications/notifications.redux.api";
import { metricsApi } from "@/infrastructure/metrics/metric.redux.api";
import profileCompletenessSlice from "../../infrastructure/user/user.requirements.slice";
import { mapsApi } from "@/infrastructure/map/map.redux.api";
import { policiesApi } from "../../infrastructure/policies/policies.redux.api";
import { accessApi } from "@/infrastructure/access/access.redux.api";
import accessSlice from "@/infrastructure/access/access.redux.slice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    [authApi.reducerPath]: authApi.reducer,
    admins: adminSlice,
    [adminApi.reducerPath]: adminApi.reducer,
    tenants: tenantReducer,
    [tenantApi.reducerPath]: tenantApi.reducer,
    owners: ownerReducer,
    [ownerApi.reducerPath]: ownerApi.reducer,
    boardingHouses: boardingHouseSlice,
    [boardingHouseApi.reducerPath]: boardingHouseApi.reducer,
    [roomApi.reducerPath]: roomApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [verificationDocumentsApi.reducerPath]: verificationDocumentsApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [metricsApi.reducerPath]: metricsApi.reducer,
    [mapsApi.reducerPath]: mapsApi.reducer,
    genericSearch: genericSearchBarSlice,
    profileCompleteness: profileCompletenessSlice,
    [policiesApi.reducerPath]: policiesApi.reducer,
    [accessApi.reducerPath]: accessApi.reducer,
    accessSlice: accessSlice,
  },
  middleware: (getDefaultMiddleware) =>
    // getDefaultMiddleware().concat(boardingHouseApi.middleware),
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(adminApi.middleware)
      .concat(tenantApi.middleware)
      .concat(ownerApi.middleware)
      .concat(boardingHouseApi.middleware)
      .concat(roomApi.middleware)
      .concat(notificationApi.middleware)
      .concat(bookingApi.middleware)
      .concat(verificationDocumentsApi.middleware)
      .concat(reviewsApi.middleware)
      .concat(metricsApi.middleware)
      .concat(mapsApi.middleware)
      .concat(policiesApi.middleware)
      .concat(accessApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
