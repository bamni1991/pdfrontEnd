import React, { useState, useEffect, useLayoutEffect } from "react";
import {
    View,
    StyleSheet,
    StatusBar,
    FlatList,
    TouchableOpacity,
    ActivityIndicator
} from "react-native";
import {
    Text,
    Surface,
    Searchbar,
    Avatar,
    IconButton
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";

const TeacherAttendanceView = ({ navigation }) => {
    const backendUrl = Constants.expoConfig.extra.backendUrl;
    const userImageBaseUrl = Constants.expoConfig.extra.userImageBaseUrl;

    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        filterTeachers();
    }, [searchQuery, teachers]);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${backendUrl}getAllTeachers`);
            // debugger;
            if (response.data && response.data.teachers) {
                setTeachers(response.data.teachers);
            } else {
                setTeachers([]);
            }
        } catch (error) {
            console.error("Error fetching teachers:", error);

        } finally {
            setLoading(false);
        }
    };

    const filterTeachers = () => {
        if (!searchQuery) {
            setFilteredTeachers(teachers);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = teachers.filter(
                (teacher) =>
                    (teacher.name && teacher.name.toLowerCase().includes(lowerQuery)) ||
                    (teacher.classKey && teacher.classKey.toLowerCase().includes(lowerQuery)) ||
                    (teacher.teacher_id && teacher.teacher_id.toString().includes(lowerQuery))
            );
            setFilteredTeachers(filtered);
        }
    };

    const handleViewAttendance = (teacher) => {
        // console.log(JSON.stringify(teacher))
        // debugger;
        navigation.navigate("TeacherAttendance", {
            teacherId: teacher.user_id ? teacher.user_id : teacher.id,
            teacherName: teacher.user.name
        });
    };

    const renderItem = ({ item }) => {
        const user = item.user || {};
        const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "T";

        // Construct Classes String
        const assignedClasses = item.classes && item.classes.length > 0
            ? item.classes.map(c => c.class?.class_name).filter(Boolean).join(", ")
            : "No assigned class";

        // Construct Image URL (assuming standard Laravel storage link)
        // Adjust this logic if your image path structure is different

        const profileImageUri = user.profile_image
            ? `${userImageBaseUrl}${user.profile_image}`
            : null;








        return (
            <Surface style={styles.card} elevation={1}>
                <View style={styles.cardContent}>
                    {profileImageUri ? (
                        <Avatar.Image
                            size={50}
                            source={{ uri: profileImageUri }}
                            style={{ backgroundColor: '#5E72EB' }}
                        />
                    ) : (
                        <Avatar.Text
                            size={50}
                            label={initials}
                            style={{ backgroundColor: '#5E72EB' }}
                            color="white"
                        />
                    )}

                    <View style={styles.infoBox}>
                        <Text style={styles.teacherName}>{user.name || "Unknown"}</Text>
                        <Text style={styles.teacherSub} numberOfLines={2}>
                            {assignedClasses}
                        </Text>
                        {user.mobile && (
                            <Text style={styles.teacherMeta}>
                                <MaterialCommunityIcons name="phone" size={12} color="#777" /> {user.mobile}
                            </Text>
                        )}
                    </View>
                    <IconButton
                        icon="calendar-month"
                        iconColor="#26A69A"
                        size={28}
                        onPress={() => handleViewAttendance(item)}
                        style={styles.actionBtn}
                    />
                </View>
            </Surface>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#26A69A" />

            <LinearGradient colors={["#26A69A", "#00897B"]} style={styles.header}>
                {/* <View style={styles.headerToolbar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Teacher Attendance</Text>
                </View> */}

                <Searchbar
                    placeholder="Search Teacher..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                    iconColor="#26A69A"
                />
            </LinearGradient>

            <View style={styles.contentContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#26A69A" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={filteredTeachers}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No teachers found.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F7FC",
    },
    header: {
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 30,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerToolbar: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    backButton: {
        padding: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
        marginRight: 15
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
    },
    searchBar: {
        borderRadius: 10,
        backgroundColor: 'white',
        height: 45,
        elevation: 2
    },
    searchInput: {
        minHeight: 0,
        fontSize: 14
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 15,
        marginTop: 10,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 10,
        overflow: 'hidden'
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    infoBox: {
        flex: 1,
        marginLeft: 15,
    },
    teacherName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    teacherSub: {
        fontSize: 12,
        color: '#777',
        marginTop: 2
    },
    teacherMeta: {
        fontSize: 12,
        color: '#5E72EB',
        marginTop: 2,
        fontWeight: '500'
    },
    actionBtn: {
        backgroundColor: '#E0F2F1',
        margin: 0
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50
    },
    emptyText: {
        color: '#999',
        fontSize: 16
    }
});

export default TeacherAttendanceView;
