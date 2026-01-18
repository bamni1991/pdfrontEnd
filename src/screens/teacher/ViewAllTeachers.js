import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import {
    View,
    StyleSheet,
    StatusBar,
    FlatList,
    Alert,
    Linking,
    TouchableOpacity,
} from "react-native";
import {
    Text,
    Searchbar,
    Card,
    Avatar,
    ActivityIndicator,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Constants from "expo-constants";
import { Dropdown } from "react-native-element-dropdown";
import Toast from "react-native-toast-message";


const ViewAllTeachers = ({ navigation }) => {
    const { user } = useAuth(); // If auth is needed

    const backendUrl = Constants.expoConfig.extra.backendUrl;
    const userImageBaseUrl = Constants.expoConfig.extra.userImageBaseUrl;

    useLayoutEffect(() => {
        navigation.getParent()?.setOptions({
            title: "Teacher List",
        });
    }, [navigation]);


    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);

    // Filter States
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [classOptions, setClassOptions] = useState([]);
    const [sessionOptions, setSessionOptions] = useState([]);

    const fetchFilterOptions = async () => {
        try {
            const response = await axios.get(`${backendUrl}getStudentFromCreatingData`);
            if (response.data.status) {
                const cls = (response.data.data.classes || []).map(c => ({ label: c.class_name, value: c.id }));
                setClassOptions([{ label: "All Classes", value: null }, ...cls]);

                const sessions = (response.data.data.academic_session || []).map(s => ({ label: s.session_name, value: s.id }));
                setSessionOptions([{ label: "All Sessions", value: null }, ...sessions]);
            }
        } catch (error) {
            console.error("Error fetching filter options:", error);
        }
    };

    const fetchTeacherData = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}getAllTeachers`);
            const teacherList = response.data.teachers || [];
            debugger;
            // Debug: Check data structure of first teacher
            if (teacherList.length > 0) {
                console.log("First Teacher Data Example:", JSON.stringify(teacherList[0], null, 2));
                if (teacherList[0].classes) {
                    console.log("First Teacher Classes:", JSON.stringify(teacherList[0].classes, null, 2));
                } else {
                    console.log("Classes property missing in teacher object");
                }
            }

            setTeachers(teacherList);
        } catch (error) {
            console.error("Error fetching teachers:", error);
            Alert.alert("Error", "Failed to fetch teachers.");
        }
    }, [backendUrl]);

    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            await Promise.all([fetchTeacherData(), fetchFilterOptions()]);
            setLoading(false);
        };

        initializeData();
    }, [fetchTeacherData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchTeacherData(), fetchFilterOptions()]);
        setRefreshing(false);
    }, [fetchTeacherData]);

    const confirmDelete = (id) => {
        Alert.alert(
            "Delete Teacher",
            "Are you sure you want to delete this teacher? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => handleDelete(id)
                }
            ]
        );
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`${backendUrl}teachers/delete/${id}`);
            if (response.data.status) {
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Teacher deleted successfully",
                });
                fetchTeacherData();
            } else {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: response.data.message || "Failed to delete teacher",
                });
            }
        } catch (error) {
            console.error("Error deleting teacher:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to delete teacher",
            });
        }
    };

    const filterData = useCallback(() => {
        let temp = teachers;

        // Filter by Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            temp = temp.filter(t => {
                const name = t.user?.name || t.full_name || t.name || "";
                const mobile = t.user?.mobile || t.mobile_no || "";
                const qualification = t.qualification || "";

                return (
                    name.toLowerCase().includes(query) ||
                    mobile.includes(query) ||
                    qualification.toLowerCase().includes(query)
                );
            });
        }

        // Filter by Class and Session
        if (selectedClass || selectedSession) {
            temp = temp.filter(t => {
                const classes = t.classes;
                if (!classes || !Array.isArray(classes)) return false;

                return classes.some(item => {
                    let itemClassId = null;
                    let itemSessionId = null;

                    if (typeof item === 'object') {
                        // Try to get Class ID
                        if (item.class && item.class.id) itemClassId = item.class.id;
                        else if (item.class_id) itemClassId = item.class_id;
                        else if (item.id && !item.teacher_id) itemClassId = item.id; // Fallback if item is a Class object directly

                        // Try to get Session ID
                        if (item.academic_session && item.academic_session.id) itemSessionId = item.academic_session.id;
                        else if (item.academic_session_id) itemSessionId = item.academic_session_id;
                    } else {
                        // Item is just an ID (assuming Class ID)
                        itemClassId = item;
                    }

                    const matchClass = !selectedClass || String(itemClassId) === String(selectedClass);
                    const matchSession = !selectedSession || String(itemSessionId) === String(selectedSession);

                    return matchClass && matchSession;
                });
            });
        }

        setFilteredTeachers(temp);
    }, [teachers, searchQuery, selectedClass, selectedSession]);

    useEffect(() => {
        filterData();
    }, [filterData]);

    const renderTeacherItem = ({ item }) => {
        const name = item.user?.name || item.name || item.full_name || "Teacher";
        const mobile = item.user?.mobile || item.mobile_no || "N/A";
        const photo = item.profile_photo || item.photo;

        return (
            <Card
                style={styles.card}
                mode="elevated"
                onPress={() => navigation.navigate('TeacherDetails', { teacherId: item.id })}
            >
                <View style={styles.cardContent}>
                    <View style={styles.leftSection}>
                        {photo ? (
                            <Avatar.Image
                                size={54}
                                source={{ uri: `${userImageBaseUrl}${photo}` }}
                                style={styles.avatar}
                            />
                        ) : (
                            <Avatar.Text
                                size={54}
                                label={name.substring(0, 2).toUpperCase()}
                                style={[styles.avatar, { backgroundColor: '#5E72EB' }]}
                                color="white"
                            />
                        )}
                    </View>

                    <View style={styles.middleSection}>
                        <View style={styles.nameRow}>
                            <Text style={styles.teacherName} numberOfLines={1}>{name}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="school" size={14} color="#666" style={styles.infoIcon} />
                            <Text style={styles.detailText} numberOfLines={1}>{item.qualification || "Qualification N/A"}</Text>
                        </View>

                        <View style={styles.rowDistanced}>
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="phone" size={14} color="#5E72EB" style={styles.infoIcon} />
                                <TouchableOpacity onPress={() => mobile !== "N/A" && Linking.openURL(`tel:${mobile}`)}>
                                    <Text style={[styles.detailText, { color: mobile !== "N/A" ? '#5E72EB' : '#666' }]}>{mobile}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.dotSeparator} />
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="briefcase-clock" size={14} color="#5E72EB" style={styles.infoIcon} />
                                <Text style={styles.detailText}>
                                    {item.experience_years || item.experience ? `${item.experience_years || item.experience} Yrs` : "Exp N/A"}
                                </Text>
                            </View>
                        </View>

                        {/* Show assigned count or classes if needed, for better UX */}
                        {item.classes && item.classes.length > 0 && (
                            <View style={[styles.infoRow, { marginTop: 4 }]}>
                                <MaterialCommunityIcons name="bookshelf" size={14} color="#666" style={styles.infoIcon} />
                                <Text style={[styles.detailText, { fontSize: 11 }]}>
                                    Classes: {item.classes.length} Assigned
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.rightSection}>
                        <TouchableOpacity
                            style={[styles.actionButton, { marginRight: 8, backgroundColor: '#E8EAFA' }]}
                            onPress={() => navigation.navigate('TeacherAdmission', { teacherId: item.id })}
                        >
                            <MaterialCommunityIcons name="pencil" size={20} color="#5E72EB" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { marginRight: 8, backgroundColor: '#FFEBEE' }]}
                            onPress={() => confirmDelete(item.id)}
                        >
                            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                        <View style={styles.actionButton}>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#5E72EB" />
                        </View>
                    </View>
                </View>
            </Card >
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5E72EB" />

            {/* Header */}
            <LinearGradient colors={["#5E72EB", "#4a5edb"]} style={styles.header}>
                <View style={styles.searchContainer}>
                    {/* Search Bar */}
                    <Searchbar
                        placeholder="Search name, mobile..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        inputStyle={styles.searchInput}
                        iconColor="#5E72EB"
                        placeholderTextColor="#888"
                    />
                </View>

                {/* Filter Row */}
                <View style={styles.filterRow}>
                    <Dropdown
                        style={[styles.dropdown, { marginRight: 6 }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={classOptions}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Class"
                        searchPlaceholder="Search..."
                        value={selectedClass}
                        onChange={item => setSelectedClass(item.value)}
                        renderLeftIcon={() => (
                            <MaterialCommunityIcons style={styles.icon} color="white" name="bookshelf" size={18} />
                        )}
                        containerStyle={styles.dropdownContainer}
                    />
                    <Dropdown
                        style={[styles.dropdown, { marginLeft: 6 }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={sessionOptions}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Session"
                        value={selectedSession}
                        onChange={item => setSelectedSession(item.value)}
                        renderLeftIcon={() => (
                            <MaterialCommunityIcons style={styles.icon} color="white" name="calendar-range" size={18} />
                        )}
                        containerStyle={styles.dropdownContainer}
                    />
                </View>
            </LinearGradient>

            {/* Teacher List */}
            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <Text style={styles.listCount}>
                        Found {filteredTeachers.length} Teachers
                    </Text>
                    {(selectedClass || selectedSession) && (
                        <TouchableOpacity onPress={() => { setSelectedClass(null); setSelectedSession(null); }}>
                            <Text style={styles.clearFilter}>Clear Filter</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#5E72EB" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={filteredTeachers}
                        renderItem={renderTeacherItem}
                        keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="account-search-outline" size={60} color="#ccc" />
                                <Text style={styles.emptyText}>No teachers found</Text>
                                {selectedClass && <Text style={styles.subEmptyText}>Try changing the class filter</Text>}
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
        backgroundColor: "#F5F7FA",
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: Constants.statusBarHeight ? Constants.statusBarHeight + 10 : 40,
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 4,
        shadowColor: "#5E72EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    searchContainer: {
        marginBottom: 12
    },
    searchBar: {
        borderRadius: 12,
        backgroundColor: "white",
        elevation: 0,
        height: 48,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    searchInput: {
        minHeight: 48,
        fontSize: 15,
        color: '#333'
    },
    filterRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    dropdown: {
        flex: 1,
        height: 44,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    dropdownContainer: {
        borderRadius: 8,
        backgroundColor: '#fff',
        elevation: 5,
        borderWidth: 1,
        borderColor: '#eee'
    },
    icon: {
        marginRight: 8,
    },
    placeholderStyle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.85)',
        fontWeight: '500'
    },
    selectedTextStyle: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600'
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 14,
    },
    iconStyle: {
        width: 18,
        height: 18,
        tintColor: 'white'
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 16,
        marginTop: 12
    },
    listHeader: {
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    listCount: {
        color: '#666',
        fontWeight: '600',
        fontSize: 14
    },
    clearFilter: {
        color: '#5E72EB',
        fontWeight: '600',
        fontSize: 12,
        textDecorationLine: 'underline'
    },
    listContent: {
        paddingBottom: 20
    },
    card: {
        marginBottom: 12,
        backgroundColor: 'white',
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        marginHorizontal: 1,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12
    },
    leftSection: {
        marginRight: 12,
    },
    avatar: {
        borderWidth: 2,
        borderColor: '#f0f0f0'
    },
    middleSection: {
        flex: 1,
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        flexWrap: 'wrap'
    },
    teacherName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2C3E50',
        marginRight: 8
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2
    },
    rowDistanced: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIcon: {
        marginRight: 4,
        opacity: 0.8
    },
    dotSeparator: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#ccc',
        marginHorizontal: 8
    },
    detailText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500'
    },
    rightSection: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        flexDirection: 'row'
    },
    actionButton: {
        backgroundColor: '#f5f7fa',
        padding: 4,
        borderRadius: 8
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        opacity: 0.5
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        marginTop: 10,
        fontWeight: '500'
    },
    subEmptyText: {
        color: '#999',
        fontSize: 13,
        marginTop: 4
    }
});

export default ViewAllTeachers;
