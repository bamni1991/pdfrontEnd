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
import { Dropdown } from "react-native-element-dropdown";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Constants from "expo-constants";


const ViewAllAdmissionStudent = ({ navigation }) => {
    const { user } = useAuth();

    const backendUrl = Constants.expoConfig.extra.backendUrl;
    const userImageBaseUrl = Constants.expoConfig.extra.userImageBaseUrl;
    // console.log(userImageBaseUrl);
    useLayoutEffect(() => {
        navigation.getParent()?.setOptions({
            title: "Student List",
        });
    }, [navigation]);


    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null); // Default to All
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [sessionOptions, setSessionOptions] = useState([]);
    const [classOptions, setClassOptions] = useState([]);



    useEffect(() => {
        const initializeData = async () => {
            try {
                const response = await axios.get(`${backendUrl}feachStudentAdminScreenData`);

                const classesWithAll = [{ label: "All", value: null }, ...(response.data.data.classes || [])];
                setClassOptions(classesWithAll);
                const sessionsWithAll = [{ label: "All", value: null }, ...(response.data.data.sessions || [])];
                setSessionOptions(sessionsWithAll);
                setStudents(response.data.data.students || []);
            } catch (error) {
                console.error(error.response?.data);
                Alert.alert("Error", "Failed to fetch student data");
            }

            setLoading(true);
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        };

        initializeData();
    }, [backendUrl]);

    const filterData = useCallback(() => {
        let temp = students;

        if (selectedSession) {
            temp = temp.filter(s => s.academic_session_id === selectedSession);
        }

        if (selectedClass) {
            temp = temp.filter(s => s.class_id === selectedClass);
        }

        if (searchQuery) {
            temp = temp.filter(s =>
                s.student_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredStudents(temp);
    }, [students, selectedSession, selectedClass, searchQuery]);

    useEffect(() => {
        filterData();
    }, [filterData]);

    const renderStudentItem = ({ item }) => {
        return (
            <Card
                style={styles.card}
                mode="elevated"
                onPress={() => navigation.navigate('StudentDetails', { studentId: item.id })}
            >
                <View style={styles.cardContent}>
                    <View style={styles.leftSection}>
                        {item.photo ? (
                            <Avatar.Image
                                size={54}
                                source={{ uri: `${userImageBaseUrl}${item.photo}` }}
                                style={styles.avatar}
                            />
                        ) : (
                            <Avatar.Text
                                size={54}
                                label={item.student_name ? item.student_name.substring(0, 2).toUpperCase() : "NA"}
                                style={[styles.avatar, { backgroundColor: '#5E72EB' }]}
                                color="white"
                            />
                        )}
                    </View>

                    <View style={styles.middleSection}>
                        <View style={styles.nameRow}>
                            <Text style={styles.studentName} numberOfLines={1}>{item.student_name}</Text>
                            <View style={styles.classBadge}>
                                <Text style={styles.classBadgeText}>{item.className}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="account-tie" size={14} color="#666" style={styles.infoIcon} />
                            <Text style={styles.detailText} numberOfLines={1}>{item.father_name}</Text>
                        </View>

                        <View style={styles.rowDistanced}>
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="phone" size={14} color="#5E72EB" style={styles.infoIcon} />
                                <TouchableOpacity onPress={() => item.mobile1 && Linking.openURL(`tel:${item.mobile1}`)}>
                                    <Text style={[styles.detailText, { color: item.mobile1 ? '#5E72EB' : '#666' }]}>{item.mobile1 || "N/A"}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.dotSeparator} />
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="calendar-month-outline" size={14} color="#5E72EB" style={styles.infoIcon} />
                                <Text style={styles.detailText}>
                                    {item.admissionDate ? new Date(item.admissionDate).toLocaleDateString('en-GB') : "N/A"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.rightSection}>
                        <TouchableOpacity
                            style={[styles.actionButton, { marginRight: 8, backgroundColor: '#E8EAFA' }]}
                            onPress={() => navigation.navigate('StudentAdmissionFrom', { studentId: item.id })}
                        >
                            <MaterialCommunityIcons name="pencil" size={20} color="#5E72EB" />
                        </TouchableOpacity>
                        <View style={styles.actionButton}>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#5E72EB" />
                        </View>
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5E72EB" />

            {/* Header */}
            <LinearGradient colors={["#5E72EB", "#4a5edb"]} style={styles.header}>
                {/* Search Bar */}
                <Searchbar
                    placeholder="Search by name..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                    iconColor="#5E72EB"
                    placeholderTextColor="#888"
                />

                {/* Filters Row */}
                <View style={styles.filterRow}>
                    {/* Class Filter */}
                    <Dropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={classOptions}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Class"
                        searchPlaceholder="Search..."
                        value={selectedClass}
                        onChange={item => setSelectedClass(item.value)}
                        renderLeftIcon={() => (
                            <MaterialCommunityIcons style={styles.icon} color="white" name="bookshelf" size={18} />
                        )}
                        containerStyle={styles.dropdownContainer}
                    />

                    {/* Session Filter */}
                    <Dropdown
                        style={[styles.dropdown, { marginLeft: 12 }]}
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

            {/* Student List */}
            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <Text style={styles.listCount}>
                        Found {filteredStudents.length} Students
                    </Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#5E72EB" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={filteredStudents}
                        renderItem={renderStudentItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="account-search-outline" size={60} color="#ccc" />
                                <Text style={styles.emptyText}>No students found</Text>
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
    searchBar: {
        borderRadius: 12,
        backgroundColor: "white",
        marginBottom: 16,
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
        justifyContent: "space-between",
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
    },
    icon: {
        marginRight: 8,
    },
    placeholderStyle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.85)',
        fontWeight: '500'
    },
    selectedTextStyle: {
        fontSize: 13,
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
    studentName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2C3E50',
        marginRight: 8
    },
    classBadge: {
        backgroundColor: '#E8EAFA',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    classBadgeText: {
        fontSize: 11,
        color: '#5E72EB',
        fontWeight: '700'
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4
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
        color: '#666',
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
    }
});

export default ViewAllAdmissionStudent;
