import { StatusBar } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from 'react-native-vector-icons/Ionicons'

import { BorderRadius, Colors } from '@/constants'

import DashboardMainScreen from '../screens/dashboard.main.screen'
import TenantManagementMainScreen from '../screens/tenant-management.screen'
import OwnerManagementMainScreen from '../screens/owner-management.main.screen'
import NotificationMainScreen from '@/features/shared/notification/notification.main.screen'
import MenuMainScreen from '@/features/shared/menu/menu.main.screen'

//layout component
import { BottomNavBarStyleConfig } from '@/components/layout/BottomNavBarStyleConfig'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { MenuStackParamListArrayName } from '@/features/shared/menu/navigation/menu.stack.types'


const Tab = createBottomTabNavigator();

const AdminTabs = () => {
  return (
    <>
      <StatusBar 
        barStyle='light-content'
      />
      <Tab.Navigator
        initialRouteName='Dashboard'
        screenOptions={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? '';
          console.log('route:', routeName);

          // const shouldHideTabBar = hideOnRoutes.includes(routeName);

          return {
            tabBarStyle: {
              backgroundColor: Colors.PrimaryLight[8],
              height: 70,
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName = 'receipt-outline';

              if (route.name === 'Dashboard') iconName = focused ? 'stats-chart' : 'stats-chart-outline'
              else if (route.name === 'TenantsManagement') iconName = focused ? 'person' : 'person-outline';
              else if (route.name === 'OwnerManagement') iconName = focused ? 'people' : 'people-outline';
              else if (route.name === 'Notification') iconName = focused ? 'notifications' : 'notifications-outline';
              else if (route.name === 'Menu') iconName = focused ? 'menu' : 'menu-outline';

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            ...BottomNavBarStyleConfig,
          };
        }}
      >
        <Tab.Screen name="Dashboard" component={DashboardMainScreen}/>
        <Tab.Screen name="TenantsManagement" component={TenantManagementMainScreen}/>
        <Tab.Screen name="OwnerManagement" component={OwnerManagementMainScreen}/>
        <Tab.Screen name="Notification" component={NotificationMainScreen}/>
        <Tab.Screen name="Menu" component={MenuMainScreen} 
          options={({ route }) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'MenuTabScreen';

            const hideTabBarRoutes = MenuStackParamListArrayName

            return {
              tabBarStyle: {
                display: hideTabBarRoutes.includes(routeName) ? 'none' : 'flex',backgroundColor: Colors.PrimaryLight[8],height: 70,
              },
              ...BottomNavBarStyleConfig,
            };
          }}
        />
      </Tab.Navigator>
    </>
  )
}

export default AdminTabs

