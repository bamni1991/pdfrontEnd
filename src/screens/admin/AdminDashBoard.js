import React, { useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ScrollView,
} from "react-native";
import { Text, Avatar, Card, Surface } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

const AdminDashBoard = ({ navigation }) => {

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      title: "Dashboard",
    });
  }, [navigation]);



  const { user } = useAuth();

  // Dummy data for the school admin dashboard
  const statsData = [
    {
      title: "Students",
      value: "1,256",
      icon: "account-school",
      color: ["#5E72EB", "#3D50C6"],
    },
    {
      title: "Teachers",
      value: "84",
      icon: "account-tie",
      color: ["#26A69A", "#00897B"],
    },
    {
      title: "Fees Collected",
      value: "₹1.2 Cr",
      icon: "cash-check",
      color: ["#FF7043", "#F4511E"],
    },
    {
      title: "Fees Pending",
      value: "₹15 L",
      icon: "cash-remove",
      color: ["#EF5350", "#E53935"],
    },
  ];

  const quickActions = [
    {
      title: "Teachers",
      icon: "account-tie",
      screen: "ManageTeachers",
      color: "#3498db",
    },
    {
      title: "Students",
      icon: "account-school",
      screen: "StudentDashboard",
      color: "#9b59b6",
    },
    {
      title: "Parents",
      icon: "human-male-female-child",
      screen: "ManageParents",
      color: "#2ecc71",
    },
    {
      title: "Fees",
      icon: "cash-multiple",
      screen: "ManageFees",
      color: "#1abc9c",
    },
    {
      title: "Announce",
      icon: "bullhorn",
      screen: "Announcements",
      color: "#f1c40f",
    },
    {
      title: "Events",
      icon: "calendar-star",
      screen: "Events",
      color: "#e67e22",
    },
  ];

  const renderStatCard = ({ item }) => (
    <TouchableOpacity
      style={styles.statCardContainer}
      activeOpacity={0.7}
      onPress={() => {
        /* Navigate to a detailed screen if needed */
      }}
    >
      <LinearGradient colors={item.color} style={styles.statCard}>
        <View style={styles.statCardContent}>
          <MaterialCommunityIcons name={item.icon} size={24} color="#fff" />
          <Text style={styles.statValue}>{item.value}</Text>
          <Text style={styles.statTitle}>{item.title}</Text>
        </View>
        <View style={styles.statCardShine} />
        <View style={styles.statCardShine2} />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderActionItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.actionItem}
      onPress={() => navigation.navigate(item.screen)}
    >
      <Surface
        style={[styles.actionIconContainer, { backgroundColor: item.color }]}
      >
        <MaterialCommunityIcons name={item.icon} size={24} color="#fff" />
      </Surface>
      <Text style={styles.actionTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#5E72EB" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#5E72EB", "#3D50C6"]}
          style={styles.headerSurface}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerText}>
                Welcome back, {user?.name.split(" ")[0] || "Admin"}!
              </Text>
              <Text style={styles.subHeaderText}>
                Here's your school's overview.
              </Text>
            </View>
            <Avatar.Image
              size={42}
              source={{
                uri: `https://ui-avatars.com/api/?name=${user?.name}&background=fff&color=5E72EB&bold=true`,
              }}
            />
          </View>
        </LinearGradient>

        <View style={styles.mainContent}>
          {/* Statistics Section */}
          <FlatList
            data={statsData}
            renderItem={renderStatCard}
            keyExtractor={(item) => item.title}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ justifyContent: "space-between" }}
          />

          <Card style={styles.sectionCard}>
            <Card.Title
              title="Quick Actions"
              titleStyle={styles.sectionTitle}
            />
            <Card.Content style={styles.actionsContainer}>
              {quickActions.map(renderActionItem)}
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fc",
  },
  headerSurface: {
    paddingHorizontal: 16,
    paddingTop: 35, // Compacted
    paddingBottom: 50, // Compacted
    borderBottomLeftRadius: 24, // Compacted
    borderBottomRightRadius: 24, // Compacted
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIcon: {
    position: "absolute",
    top: -10,
    left: 0,
  },
  headerText: {
    fontSize: 20, // Compacted
    fontWeight: "bold",
    color: "#fff",
    textAlign: "left", // Changed to left for better flow
  },
  subHeaderText: {
    fontSize: 13, // Compacted
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 0, // Compacted
    textAlign: "left",
  },
  mainContent: {
    paddingHorizontal: 12, // Compacted side padding
    marginTop: -35, // adjusted for overlap
  },
  statCardContainer: {
    flex: 1,
    margin: 6, // Compacted
  },
  statCard: {
    flex: 1,
    borderRadius: 12, // Compacted
    padding: 12, // Compacted
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    overflow: "hidden",
  },
  statCardContent: {
    alignItems: "flex-start",
  },
  statCardShine: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 100,
    height: 100,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 50,
    transform: [{ rotate: "20deg" }],
  },
  statCardShine2: {
    position: "absolute",
    bottom: -50,
    left: -30,
    width: 80,
    height: 80,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 40,
  },
  statValue: {
    fontSize: 20, // Compacted
    fontWeight: "bold",
    color: "#fff",
    marginTop: 4, // Compacted
  },
  statTitle: {
    fontSize: 12, // Compacted
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  sectionCard: {
    marginTop: 12, // Compacted
    borderRadius: 12, // Compacted
    backgroundColor: "#fff",
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16, // Compacted
    fontWeight: "bold",
    color: "#1e293b",
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // Spread evenly
    paddingTop: 8,
    paddingHorizontal: 4, // Add slight padding
  },
  actionItem: {
    alignItems: "center",
    width: "23%", // 4 items per row if we want, or stick to 3 but smaller. Let's keep 3 for now but smaller width -> "30%". Or maybe 4 items is better for compactness? Let's check the list: Teachers, Students, Parents, Fees, Announce, Events (6 items). 4 per row means 4 then 2. 3 per row is 3 then 3. 3 per row is better for symmetry.
    width: "30%",
    marginBottom: 12, // Compacted
  },
  actionIconContainer: {
    width: 48, // Compacted
    height: 48, // Compacted
    borderRadius: 14, // Compacted
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  actionTitle: {
    marginTop: 4, // Compacted
    fontSize: 11, // Compacted
    fontWeight: "500",
    color: "#475569",
    textAlign: "center",
  },
});

export default AdminDashBoard;
