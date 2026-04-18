import { View, StyleSheet } from "react-native";
import { Box } from "@gluestack-ui/themed";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect } from "react";
import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";

import {
  Colors,
  Fontsize,
  GlobalStyle,
  Spacing,
  BorderRadius,
} from "@/constants";
import { VStack } from "@gluestack-ui/themed";
import { useDynamicUserApi } from "@/infrastructure/user/user.hooks";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Owner } from "@/infrastructure/owner/owner.types";
// import { Button } from "@react-navigation/elements";

import { useGetAllQuery as useGetAllQueryBH } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import PaginatedSearchList from "@/components/layout/PaginatedSearchList/PaginatedSearchList";
import { QueryBoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.schema";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PropertiesStackParamList } from "./navigation/properties.stack.types";
import ScreenHeaderComponent from "@/components/layout/ScreenHeaderComponent";
import PropertyCard from "../../../../components/ui/BoardingHouseItems/PropertyCard";
import { Text, useTheme, Button } from "react-native-paper";
import { navigationRef } from "../../../../application/navigation/navigationRef";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

export default function PropertiesMainScreen() {
  const theme = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const propertyNavigation =
    useNavigation<NativeStackNavigationProp<PropertiesStackParamList>>();

  const isFocused = useIsFocused();
  const { selectedUser } = useDynamicUserApi();
  const owner = selectedUser as Owner;

  const triggerHaptic = () => ReactNativeHapticFeedback.trigger("impactLight");

  const {
    data: boardingHouses,
    isLoading,
    refetch,
  } = useGetAllQueryBH(
    { ownerId: owner?.id },
    { skip: !owner?.id, refetchOnMountOrArgChange: true },
  );

  const handlePageRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <StaticScreenWrapper
      variant="list"
      style={{ backgroundColor: theme.colors.background }}
      refreshing={refreshing}
      onRefresh={handlePageRefresh}
      loading={isLoading}
    >
      <View style={s.mainContainer}>
        <View style={s.listHeader}>
          <Text variant="displaySmall" style={s.title}>
            Manage Properties
          </Text>
        </View>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => {
            triggerHaptic();
            // navigationRef.navigate("Properties" as any, {
            //   screen: "PropertyCreate",
            // });
            propertyNavigation.navigate("PropertyCreate");
          }}
          style={s.fabReplica}
          labelStyle={s.buttonLabel}
        >
          Create
        </Button>

        {/* 5. SEARCH & LIST */}
        <PaginatedSearchList<QueryBoardingHouse>
          ownerId={owner?.id}
          useApi={useGetAllQueryBH}
          apiParams={{ minPrice: 1500 }}
          searchKey="name"
          renderItem={({ item }) => (
            <PropertyCard data={item}>
              <Button
                mode="contained-tonal"
                icon="cog"
                onPress={() => {
                  triggerHaptic();
                  propertyNavigation.navigate("BoardingHouseDetailsScreen", {
                    id: item.id!,
                  });
                  // navigate.navigate("BoardingHouseDetailsScreen", {
                  //   id: item.id,
                  // });
                }}
                style={s.manageBtn}
                labelStyle={s.manageLabel}
              >
                Manage Property
              </Button>
            </PropertyCard>
          )}
          searchPlaceholder="Search properties"
          renderEmpty={() => (
            <View style={s.emptyContainer}>
              <Text style={s.emptyText}>No boarding houses found</Text>
            </View>
          )}
        />
      </View>
    </StaticScreenWrapper>
  );
}
{
  /* <Button onPress={() => propertyNavigation.navigate("PropertyCreate")}>
  <Text>Add Property</Text>
</Button> */
}

const s = StyleSheet.create({
  title: {
    fontFamily: "Poppins-Bold",
    color: "#1A1A1A",
  },
  mainContainer: {
    gap: Spacing.md,
  },
  fabReplica: {
    borderRadius: BorderRadius.md,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    // alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  headerSection: {
    marginBottom: 24,
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: "Poppins-Bold",
    color: "#1A1A1A",
  },
  buttonLabel: {
    fontFamily: "Poppins-SemiBold",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    padding: Spacing.lg,
  },
  emptyText: {
    fontFamily: "Poppins-Regular",
    color: "#CCCCCC",
  },
  manageBtn: {
    marginTop: 8,
    borderRadius: BorderRadius.md,
  },
  manageLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
  },
});
