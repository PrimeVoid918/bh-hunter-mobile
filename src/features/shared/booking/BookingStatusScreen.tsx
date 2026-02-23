import { View, Text, Linking, StyleSheet } from "react-native";
import React from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import { Colors, Fontsize, GlobalStyle, Spacing } from "@/constants";
import { Box, VStack } from "@gluestack-ui/themed";
import BookingDecisionBlock from "./BookingDecisionBlock";
import BookingPaymentBlock from "./BookingPaymentBlock";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import {
  useCancelBookingMutation,
  useCreatePaymongoCheckoutMutation,
  useGetAllQuery,
  useGetOneQuery as useGetOneBookinQuery,
  usePatchApproveBookingMutation,
  usePatchRejectBookingMutation,
} from "@/infrastructure/booking/booking.redux.api";
import UserInformationCard from "@/components/ui/Information/UserInformatioCard";
import { useGetOneQuery as useGetOneTenantQuery } from "@/infrastructure/tenants/tenant.redux.api";
import { useGetOneQuery as useGetOneOwnerQuery } from "@/infrastructure/owner/owner.redux.api";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import BookingBHCard from "./BookingBHCard";
import BookingRoomCard from "./BookingRoomCard";
import { GetBooking } from "@/infrastructure/booking/booking.schema";
import { Icon, Surface, useTheme } from "react-native-paper";
import PayMongoWebView from "./PaymongoWebView";
import PlatformGuidelines from "./PlatformGuidelines";
import BookingInfoBar from "./BookingInfoBar";

type Role = "TENANT" | "OWNER";

export default function BookingStatusScreen({ route }) {
  const { bookId }: { bookId: number } = route.params;

  const { selectedUser } = useDynamicUserApi();
  if (!selectedUser) {
    return <Text>Loading user...</Text>;
  }

  // const [userData, setUserData] = React.useState<any>({});

  const role = selectedUser?.role as Role;
  const userId = selectedUser?.id!;

  const [refreshing, setRefreshing] = React.useState(false);

  const {
    data: bookingData,
    isLoading,
    isError,
    refetch,
  } = useGetAllQuery({ page: 1, bookId: bookId, limit: 15 });
  const booking = bookingData?.[0] as GetBooking;

  const tenantQuery = useGetOneTenantQuery(booking?.tenantId!, {
    skip: role !== "OWNER" || !booking,
  });

  const ownerQuery = useGetOneOwnerQuery(booking?.boardingHouse?.ownerId!, {
    skip: role !== "TENANT" || !booking,
  });
  const userData =
    role === "OWNER"
      ? tenantQuery.data
      : role === "TENANT"
        ? ownerQuery.data
        : undefined;
  // const { data: tenantData } = useGetOneTenantQuery(booking?.tenantId!);

  const [approveBooking] = usePatchApproveBookingMutation();
  const [rejectBooking] = usePatchRejectBookingMutation();
  const [cancelBooking] = useCancelBookingMutation();
  // const [createCheckout] = useCreatePaymongoCheckoutMutation();
  const [createCheckout, { isLoading: isCheckOutLoading }] =
    useCreatePaymongoCheckoutMutation();

  const [checkoutUrl, setCheckoutUrl] = React.useState<string | null>(null);
  const [showWebView, setShowWebView] = React.useState(false);
  const handlePayNow = async () => {
    try {
      const response = await createCheckout({
        bookingId: booking!.id,
      }).unwrap();

      // Instead of Linking.openURL, we trigger the WebView
      setCheckoutUrl(response.checkoutUrl);
      setShowWebView(true);
    } catch (error) {
      console.error("Failed to create PayMongo checkout:", error);
    }
  };
  // const handlePayNow = async () => {
  //   try {
  //     const response = await createCheckout({
  //       bookingId: booking!.id,
  //     }).unwrap();
  //     const { checkoutUrl } = response;

  //     // Redirect tenant to PayMongo checkout in WebView / external browser
  //     console.log("check: ", checkoutUrl);
  //     Linking.openURL(checkoutUrl);
  //   } catch (error) {
  //     console.error("Failed to create PayMongo checkout:", error);
  //   }
  // };

  const handlePageRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  const theme = useTheme();
  if (isLoading || !booking) {
    return <FullScreenLoaderAnimated />;
  }

  return (
    <StaticScreenWrapper
      variant="list"
      style={
        (GlobalStyle.GlobalsContainer,
        {
          paddingLeft: Spacing.md,
          paddingRight: Spacing.md,
          paddingTop: Spacing.md,
          paddingBottom: 200,
        })
      }
      contentContainerStyle={GlobalStyle.GlobalsContentContainer}
      refreshing={refreshing}
      onRefresh={handlePageRefresh}
      loading={isLoading}
      error={[isError ? "" : null]}
    >
      <VStack style={[s.container]}>
        <Text
          style={[
            s.text_color,
            { fontSize: Fontsize.h1, fontWeight: "900", textAlign: "center" },
          ]}
        >
          Reservation Status
        </Text>
        <BookingBHCard data={booking}></BookingBHCard>
        <BookingRoomCard data={booking}></BookingRoomCard>

        <BookingInfoBar data={booking} />

        <UserInformationCard user={userData} />

        <PlatformGuidelines />

        <BookingDecisionBlock
          booking={booking}
          viewerRole={role}
          onApprove={(message: string) =>
            approveBooking({
              id: bookId,
              payload: { ownerId: userId, message: message },
            }).then(refetch)
          }
          onReject={(reason: string) =>
            rejectBooking({
              id: bookId,
              payload: { ownerId: userId, reason: reason },
            }).then(refetch)
          }
          onCancel={(reason: string) =>
            cancelBooking({
              id: bookId,
              payload: { userId, role: role, reason: reason },
            }).then(refetch)
          }
        />
        <BookingPaymentBlock
          booking={booking}
          viewerRole={role}
          // onUploadProof={handleUploadProof}
          onPayNow={handlePayNow}
          // onVerifyPayment={handleVerifyPayment}
        />
      </VStack>
      {checkoutUrl && (
        <PayMongoWebView
          visible={showWebView}
          checkoutUrl={checkoutUrl}
          onClose={() => setShowWebView(false)}
          onSuccess={() => {
            setShowWebView(false);
            refetch(); // Refresh booking status immediately
          }}
          onCancel={() => setShowWebView(false)}
        />
      )}
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignContent: "center",
    // borderWidth: 3,
    gap: Spacing.base,
  },

  text_color: {
    color: Colors.TextInverse[2],
  },
  infoSurface: {
    padding: 16,
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
});

// Two states
//  ├ StatefulElement        #1 → Booking Decision
//  ├ StatefulElement        #2 → Payment
// BookingStatusScreen
//  ├ BookingDecisionBlock   ← stateful element #1
//  ├ PaymentBlock           ← stateful element #2

/**
 Element 1 state

PENDING_REQUEST
REJECTED_BOOKING
AWAITING_PAYMENT

Tenant
PENDING_REQUEST	  “Waiting for owner approval”
REJECTED_BOOKING	"Owner message"
AWAITING_PAYMENT  “Booking accepted”

Owner
PENDING_REQUEST	  Accept / Reject + message
REJECTED_BOOKING	Locked
AWAITING_PAYMENT	Locked


Element 2 state
“Cancelled payment = cancelled booking” => absolute rule

AWAITING_PAYMENT
PAID
CANCELLED_BOOKING

Tenant
AWAITING_PAYMENT	Advance Pay Button + Disclaimer
PAID	            Payment successful
CANCELLED_BOOKING	Booking cancelled

Owner
AWAITING_PAYMENT	Waiting for payment
PAID	            Payment received
CANCELLED_BOOKING	Booking cancelled
 */
