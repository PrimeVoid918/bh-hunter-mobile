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
import Header from "@/components/ui/Header";
import ScreenHeaderComponent from "../../../components/layout/ScreenHeaderComponent";
import UserInformationCard from "@/components/ui/Information/UserInformatioCard";
import { useGetOneQuery as useGetOneTenantQuery } from "@/infrastructure/tenants/tenant.redux.api";
import { useGetOneQuery as useGetOneOwnerQuery } from "@/infrastructure/owner/owner.redux.api";
import Container from "@/components/layout/Container/Container";
import FullScreenLoaderAnimated from "@/components/ui/FullScreenLoaderAnimated";
import BookingBHCard from "./BookingBHCard";
import BookingRoomCard from "./BookingRoomCard";
import Markdown from "react-native-markdown-display";
import FullScreenErrorModal from "@/components/ui/FullScreenErrorModal";
import { GetBooking } from "@/infrastructure/booking/booking.schema";

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
    isLoading: bookingLoading,
    refetch: refetchBooking,
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

  const handlePayNow = async () => {
    try {
      const response = await createCheckout({
        bookingId: booking!.id,
      }).unwrap();
      const { checkoutUrl } = response;

      // Redirect tenant to PayMongo checkout in WebView / external browser
      console.log("check: ", checkoutUrl);
      Linking.openURL(checkoutUrl);
    } catch (error) {
      console.error("Failed to create PayMongo checkout:", error);
    }
  };

  if (bookingLoading || !booking) {
    return <FullScreenLoaderAnimated />;
  }
  console.log("bookinf data: ", booking);

  const handlePageRefresh = () => {
    setRefreshing(true);
    refetchBooking();
    setRefreshing(false);
  };

  return (
    <StaticScreenWrapper
      style={[GlobalStyle.GlobalsContainer]}
      contentContainerStyle={[GlobalStyle.GlobalsContentContainer]}
      wrapInScrollView={false}
    >
      {isCheckOutLoading && <FullScreenLoaderAnimated />}
      <Container refreshing={refreshing} onRefresh={handlePageRefresh}>
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
          <Box
            style={{ padding: 12, borderRadius: 8, backgroundColor: "#f0f0f0" }}
          >
            <Text style={{ fontWeight: "600" }}>
              Booking Reference: {booking.reference}
            </Text>
            <Text>Status: {booking.status}</Text>
            <Text>
              Date Booked: {new Date(booking.checkInDate).toLocaleDateString()}
            </Text>
          </Box>

          <UserInformationCard user={userData} />

          <Markdown style={customStyles}>
            {`This platform is a matchmaking tool connecting tenants and boarding house owners.
- Tenants compete to secure rooms and owners compete to attract tenants.
- Booking through this system **only logs a reservation intent**.
- Final arrangements, payments, and agreements occur directly between the tenant and owner.
- Advance payments or guarantees can be done via the system (optional), but users may also transact externally at their discretion.`}
          </Markdown>
          <BookingDecisionBlock
            booking={booking}
            viewerRole={role}
            onApprove={(message: string) =>
              approveBooking({
                id: bookId,
                payload: { ownerId: userId, message: message },
              }).then(refetchBooking)
            }
            onReject={(reason: string) =>
              rejectBooking({
                id: bookId,
                payload: { ownerId: userId, reason: reason },
              }).then(refetchBooking)
            }
            onCancel={(reason: string) =>
              cancelBooking({
                id: bookId,
                payload: { userId, role: role, reason: reason },
              }).then(refetchBooking)
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
      </Container>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignContent: "center",
    // borderWidth: 3,
    padding: Spacing.base,
    gap: Spacing.base,
  },

  text_color: {
    color: Colors.TextInverse[2],
  },
});

const customStyles = {
  body: { color: "white" },
  paragraph: { color: "white", lineHeight: 20 },
  heading1: { color: "white", fontSize: 24 },
  heading2: { color: "white", fontSize: 22 },
  heading3: { color: "white", fontSize: 20 },
  heading4: { color: "white", fontSize: 18 },
  heading5: { color: "white", fontSize: 16 },
  heading6: { color: "white", fontSize: 14 },
  link: { color: "white", textDecorationLine: "underline" },
  blockquote: { color: "white", fontStyle: "italic" },
  list_item: { color: "white" },
  strong: { color: "white", fontWeight: "bold" },
  em: { color: "white", fontStyle: "italic" },
  code_inline: { color: "white", backgroundColor: "#333" },
  code_block: { color: "white", backgroundColor: "#333" },
};

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
