import React, { useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { Text, Avatar, Card } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

const getDashboardItems = (role) => {


  const adminItems = [
    {
      title: "Student List",
      icon: "account-multiple-outline",
      screen: "ViewAllAdmissionStudent",
      color: "#5E72EB",
    },
    {
      title: "Student Admission",
      icon: "account-plus-outline",
      screen: "StudentAdmissionFrom",
      color: "#5E72EB",
    },
    {
      title: "Attendance Record",
      icon: "calendar-search",
      screen: "Attendance",
      color: "#26A69A",
    },
    {
      title: "Fee Management",
      icon: "cash-sync",
      screen: "FeeDetails",
      color: "#1abc9c",
    },
    {
      title: "Academic History",
      icon: "history",
      screen: "AcademicHistory",
      color: "#EF5350",
    },
    {
      title: "Issue TC",
      icon: "file-certificate-outline",
      screen: "IssueTC",
      color: "#9b59b6",
    },
    {
      title: "Login History",
      icon: "login",
      screen: "LoginHistory",
      color: "#e67e22",
    },
  ];
  const parentItems = [
    {
      title: "Child's Profile",
      icon: "account-child-outline",
      screen: "ViewAllAdmissionStudent",
      color: "#5E72EB",
    },
    {
      title: "Attendance",
      icon: "calendar-check-outline",
      screen: "Attendance",
      color: "#26A69A",
    },
    {
      title: "Homework",
      icon: "book-open-page-variant-outline",
      screen: "Homework",
      color: "#FF7043",
    },
    { title: "Results", icon: "poll", screen: "Results", color: "#EF5350" },
    {
      title: "Fee Status",
      icon: "cash-check",
      screen: "FeeDetails",
      color: "#1abc9c",
    },
    {
      title: "Announcements",
      icon: "bullhorn-outline",
      screen: "Announcements",
      color: "#f1c40f",
    },
    {
      title: "Timetable",
      icon: "calendar-month-outline",
      screen: "Timetable",
      color: "#9b59b6",
    },
    {
      title: "Contact Teacher",
      icon: "account-tie-voice-outline",
      screen: "ContactTeacher",
      color: "#e67e22",
    },
  ];

  const teacherItems = [
    {
      title: "Student Info",
      icon: "account-details-outline",
      screen: "ViewAllAdmissionStudent",
      color: "#5E72EB",
    },
    {
      title: "Mark Attendance",
      icon: "calendar-check",
      screen: "MarkAttendance",
      color: "#26A69A",
    },
    {
      title: "Assign Homework",
      icon: "book-plus-outline",
      screen: "AssignHomework",
      color: "#FF7043",
    },
    {
      title: "Enter Marks",
      icon: "format-list-numbered",
      screen: "EnterMarks",
      color: "#EF5350",
    },
    {
      title: "Performance",
      icon: "chart-line",
      screen: "StudentPerformance",
      color: "#9b59b6",
    },
    {
      title: "Contact Parent",
      icon: "card-account-phone-outline",
      screen: "ContactParent",
      color: "#3498db",
    },
  ];
  switch (role) {
    case "admin":
      return adminItems;
    case "teacher":
      return teacherItems;
    case "parent":
      return parentItems;
  }
};

const StudentDashboard = ({ navigation }) => {



  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      title: "Student Dashboard",
    });
  }, [navigation]);




  const { user, role_name } = useAuth();

  // Get the appropriate dashboard items based on the user's role
  const dashboardItems = getDashboardItems(role_name) || [];

  const handleCardPress = (item) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else {
      alert(`Navigating to ${item.title}`);
    }
  };

  const renderDashboardItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => handleCardPress(item)} // Changed activeOpacity to 0.7 for better feedback
      activeOpacity={0.7}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <MaterialCommunityIcons
            name={item.icon}
            size={32}
            color={item.color}
          />
          <Text style={styles.cardTitle}>{item.title}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#5E72EB" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#5E72EB", "#3D50C6"]} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerText}>
                Hi, {user?.name?.split(" ")[0] || "Student"}!
              </Text>
              <Text style={styles.subHeaderText}>
                Welcome to your Student Dashboard.
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
          <FlatList
            data={dashboardItems}
            renderItem={renderDashboardItem}
            keyExtractor={(item) => item.title}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ justifyContent: "space-between" }}
          />
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
  header: {
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
  headerText: {
    fontSize: 20, // Compacted
    fontWeight: "bold",
    color: "white",
  },
  subHeaderText: {
    fontSize: 13, // Compacted
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 0, // Compacted
  },
  mainContent: {
    paddingHorizontal: 12, // Compacted
    marginTop: -35, // Compacted
  },
  cardContainer: {
    flex: 1,
    margin: 6, // Compacted
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12, // Compacted
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    alignItems: "center",
    padding: 12, // Compacted
    justifyContent: "center",
    minHeight: 100, // Compacted
  },
  cardTitle: {
    marginTop: 8, // Compacted
    fontSize: 13, // Compacted
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
  },
});

export default StudentDashboard;
