import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

import StaticScreenWrapper from "@/components/layout/StaticScreenWrapper";
import PropertyCard from "@/components/ui/BoardingHouseItems/PropertyCard";
import PaginatedSearchList from "@/components/layout/PaginatedSearchList/PaginatedSearchList";

import { Spacing } from "@/constants";
import { useGetAllQuery as useGetAllBoardingHouses } from "@/infrastructure/boarding-houses/boarding-house.redux.api";
import { QueryBoardingHouse } from "@/infrastructure/boarding-houses/boarding-house.schema";

export default function BookingListsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  const handleGotoPress = (id: number) => {
    navigation.navigate("Booking", {
      screen: "BoardingHouseDetails",
      params: { id, fromMaps: true },
    });
  };

  return (
    <StaticScreenWrapper
      variant="form"
      style={{ backgroundColor: theme.colors.background }}
    >
      <View style={s.container}>
        <PaginatedSearchList<QueryBoardingHouse>
          useApi={useGetAllBoardingHouses} // RTK Query hook
          apiParams={{ minPrice: 1500 }} // default params
          searchKey="name" // string field for API search
          renderItem={({ item }) => (
            <PropertyCard data={item}>
              <Button
                mode="contained-tonal"
                onPress={() => handleGotoPress(item.id ?? 0)}
                labelStyle={{ fontWeight: "bold" }}
              >
                View Details
              </Button>
            </PropertyCard>
          )}
          searchPlaceholder="Search boarding houses"
          contentContainerStyle={s.listContent}
          renderEmpty={() => (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Button mode="text" disabled>
                No boarding houses found
              </Button>
            </View>
          )}
        />
      </View>
    </StaticScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md },
  listContent: { paddingBottom: 100, gap: Spacing.md },
});
