import { configureStore } from "@reduxjs/toolkit";
import boardingHouseSlice from "@/infrastructure/boarding-houses/boarding-house.redux.slice";
import { boardingHouseApi } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import authSlice, { authApi } from "@/infrastructure/auth/auth.redux.slice";
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
    genericSearch: genericSearchBarSlice,
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
      .concat(metricsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
