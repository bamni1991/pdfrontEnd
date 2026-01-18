import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomDrawerContent from "../components/layout/CustomDrawerContent";
import { createDrawerNavigator } from "@react-navigation/drawer";
// src/screens/admin/AdminDashBoard.js
// C:\xampp\htdocs\padmavati\src\navigation\AdminNavigator.js
import AdminNavigator from "../navigation/AdminNavigator";
import TeacherNavigator from "../navigation/TeacherNavigator";
import ParentNavigator from "../navigation/ParentNavigator";

import { useAuth } from "../context/AuthContext";

const DrawerNavigator = () => {
  const Drawer = createDrawerNavigator();
  const { role_name } = useAuth();
  // debugger;
  // Normalize role name for comparison (handle potential casing issues)
  const role = role_name ? role_name.toLowerCase() : "";

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerBackground: () => (
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        ),
        headerStyle: {
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 20,
          color: "#ffffff",
          letterSpacing: -0.5,
        },
        drawerStyle: {
          backgroundColor: "#ffffff",
          width: 300,
        },
        drawerActiveTintColor: "#6366f1",
        drawerInactiveTintColor: "#64748b",
        drawerActiveBackgroundColor: "#eef2ff",
        drawerInactiveBackgroundColor: "transparent",
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 12,
          marginVertical: 4,
          paddingHorizontal: 8,
        },
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: "500",
          marginLeft: -16,
        },
      }}
    >
      {/* Admin Role */}
      {(role === "admin" || !role) && (
        <Drawer.Screen
          name="AdminNavigator"
          component={AdminNavigator}
          options={{
            title: "Admin Dashboard",
            drawerLabel: "Dashboard",
          }}
        />
      )}

      {/* Teacher Role */}
      {role === "teacher" && (
        <Drawer.Screen
          name="TeacherNavigator"
          component={TeacherNavigator}
          options={{
            title: "Teacher Dashboard",
            drawerLabel: "Dashboard",
          }}
        />
      )}

      {/* Parent/Student Role */}
      {(role === "parent" || role === "student") && (
        <Drawer.Screen
          name="ParentNavigator"
          component={ParentNavigator}
          options={{
            title: "Student Dashboard",
            drawerLabel: "Dashboard",
          }}
        />
      )}
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
