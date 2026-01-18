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
            title: "Teacher List",
            icon: "account-multiple-outline",
            screen: "ViewAllTeachers",
            color: "#5E72EB",
        },
        {
            title: "Create Teacher",
            icon: "account-plus-outline",
            screen: "TeacherAdmission",
            color: "#5E72EB",
        },
        {
            title: "Teacher Attendance",
            icon: "calendar-search",
            screen: "TeacherAttendanceView",
            color: "#26A69A",
        },
        {
            title: "Salary By Class",
            icon: "cash-sync",
            screen: "TeacherSalary",
            color: "#1abc9c",
        },
    ];

    const teacherItems = [
        {
            title: "Student Attendance",
            icon: "checkbox-marked-circle-outline",
            screen: "MarkAttendance",
            color: "#26A69A",
        },
        {
            title: "My Attendance",
            icon: "calendar-account-outline",
            screen: "TeacherMarkAttendance",
            color: "#1abc9c",
        },
        {
            title: "My Students",
            icon: "account-group-outline",
            screen: "MyStudents",
            color: "#5E72EB",
        },
        {
            title: "Homework / Activity",
            icon: "book-plus-outline",
            screen: "AssignHomework",
            color: "#FF7043",
        },
        {
            title: "Daily Notes",
            icon: "note-text-outline",
            screen: "DailyNotes",
            color: "#F4B400",
        },
        {
            title: "Student Progress",
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
        {
            title: "My Timetable",
            icon: "timetable",
            screen: "MyTimetable",
            color: "#1abc9c",
        },
        {
            title: "My Profile",
            icon: "account-circle-outline",
            screen: "TeacherProfile",
            color: "#607D8B",
        },
    ];

    if (role === 'admin') {
        return adminItems;
    }
    return teacherItems;
};

const TeacherDashboard = ({ navigation }) => {
    useLayoutEffect(() => {
        navigation.getParent()?.setOptions({
            title: "Teacher Dashboard",
        });
    }, [navigation]);

    const { user, role_name } = useAuth();
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
            onPress={() => handleCardPress(item)}
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
                                Hi, {user?.name?.split(" ")[0] || "Teacher"}!
                            </Text>
                            <Text style={styles.subHeaderText}>
                                Welcome to your Teacher Dashboard.
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
        paddingTop: 35,
        paddingBottom: 50,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
    },
    subHeaderText: {
        fontSize: 13,
        color: "rgba(255, 255, 255, 0.8)",
        marginTop: 0,
    },
    mainContent: {
        paddingHorizontal: 12,
        marginTop: -35,
    },
    cardContainer: {
        flex: 1,
        margin: 6,
    },
    card: {
        backgroundColor: "white",
        borderRadius: 12,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardContent: {
        alignItems: "center",
        padding: 12,
        justifyContent: "center",
        minHeight: 100,
    },
    cardTitle: {
        marginTop: 8,
        fontSize: 13,
        fontWeight: "600",
        color: "#475569",
        textAlign: "center",
    },
});

export default TeacherDashboard;
