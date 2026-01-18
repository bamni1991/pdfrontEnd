import React, { useState, useEffect, useLayoutEffect } from "react";
import {
    View,
    StyleSheet,
    StatusBar,
    FlatList,
    TouchableOpacity,
    Alert,
    Platform,
    KeyboardAvoidingView
} from "react-native";
import {
    Text,
    Surface,
    Modal,
    TextInput,
    Button,
    Searchbar,
    FAB,
    Chip,
    IconButton,
    Menu,
    Divider,
    Portal
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import axios from "axios";
import Constants from "expo-constants";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dropdown } from "react-native-element-dropdown";
import Toast from "react-native-toast-message";

const SchoolHoliday = ({ navigation }) => {
    const backendUrl = Constants.expoConfig.extra.backendUrl;

    const [loading, setLoading] = useState(false);
    const [holidays, setHolidays] = useState([]);
    const [filteredHolidays, setFilteredHolidays] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedHolidayId, setSelectedHolidayId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        holiday_name: "",
        holiday_date: new Date(),
        holiday_type: "school", // school, national, festival
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Filters
    const currentYear = moment().year();
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const yearOptions = [
        { label: (currentYear - 1).toString(), value: (currentYear - 1).toString() },
        { label: currentYear.toString(), value: currentYear.toString() },
        { label: (currentYear + 1).toString(), value: (currentYear + 1).toString() },
    ];

    const holidayTypes = [
        { label: "School Holiday", value: "school" },
        { label: "National Holiday", value: "national" },
        { label: "Festival", value: "festival" },
    ];

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,

        });

        navigation.getParent()?.setOptions({
            title: "School Holiday",

        });





    }, [navigation]);

    useEffect(() => {
        fetchHolidays();
    }, [selectedYear]);

    useEffect(() => {
        filterHolidays();
    }, [searchQuery, holidays]);

    const fetchHolidays = async () => {
        setLoading(true);
        try {

            // Replace with actual API endpoint
            const response = await axios.get(`${backendUrl}school-holidays?year=${selectedYear}`);

            // debugger
            if (response?.data) {
                setHolidays(response?.data);
            }

            // Mock Data

            setLoading(false);


        } catch (error) {
            console.error("Error fetching holidays:", error);
            setLoading(false);
            // debugger
            // Alert.alert("Error", "Failed to fetch holidays");
        }
    };

    const filterHolidays = () => {
        if (!searchQuery) {
            setFilteredHolidays(holidays);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = holidays.filter(
                (item) =>
                    item.holiday_name.toLowerCase().includes(lowerQuery) ||
                    item.holiday_type.toLowerCase().includes(lowerQuery)
            );
            setFilteredHolidays(filtered);
        }
    };

    const handleSave = async () => {
        if (!formData.holiday_name || !formData.holiday_date) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please fill all fields"
            });
            return;
        }

        const dateStr = moment(formData.holiday_date).format("YYYY-MM-DD");
        const payload = {
            ...formData,
            holiday_date: dateStr,
            academic_session_id: 1 // Assuming 1 for now or fetch from context
        };

        try {
            if (isEditing) {
                // Update
                await axios.put(`${backendUrl}school-holidays/${selectedHolidayId}`, payload);

                // Mock Update
                const updatedList = holidays.map(h =>
                    h.id === selectedHolidayId ? { ...h, ...payload, id: selectedHolidayId } : h
                );
                setHolidays(updatedList);
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Holiday updated successfully"
                });
            } else {
                // Create
                await axios.post(`${backendUrl}school-holidays`, payload);

                // Mock Create
                const newId = holidays.length > 0 ? Math.max(...holidays.map(h => h.id)) + 1 : 1;
                setHolidays([...holidays, { ...payload, id: newId }]);
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Holiday added successfully"
                });
            }
            closeModal();
        } catch (error) {
            console.error("Error saving holiday:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to save holiday"
            });
        }
    };

    const handleDelete = (id) => {
        Alert.alert("Delete Holiday", "Are you sure you want to delete this holiday?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await axios.delete(`${backendUrl}school-holidays/${id}`);

                        // Mock Delete
                        setHolidays(holidays.filter(h => h.id !== id));
                        Toast.show({
                            type: "success",
                            text1: "Success",
                            text2: "Holiday deleted successfully"
                        });
                        // Alert.alert("Success", "Holiday deleted");   
                    } catch (error) {
                        console.error("Error deleting:", error);
                        Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: "Failed to delete holiday"
                        });
                        // Alert.alert("Error", "Failed to delete holiday");

                    }
                },
            },
        ]);
    };

    const openModal = (holiday = null) => {
        if (holiday) {
            setIsEditing(true);
            setSelectedHolidayId(holiday.id);
            setFormData({
                holiday_name: holiday.holiday_name,
                holiday_date: new Date(holiday.holiday_date),
                holiday_type: holiday.holiday_type
            });
        } else {
            setIsEditing(false);
            setSelectedHolidayId(null);
            setFormData({
                holiday_name: "",
                holiday_date: new Date(),
                holiday_type: "school"
            });
        }
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setIsEditing(false);
    };

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || formData.holiday_date;
        setShowDatePicker(Platform.OS === 'ios');
        setFormData({ ...formData, holiday_date: currentDate });
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'national': return '#FF9800';
            case 'festival': return '#E91E63';
            default: return '#2196F3'; // school
        }
    };

    const renderItem = ({ item }) => (
        <Surface style={styles.card} elevation={2}>
            <View style={[styles.colorStrip, { backgroundColor: getTypeColor(item.holiday_type) }]} />
            <View style={styles.cardContent}>
                <View style={styles.dateBox}>
                    <Text style={styles.dateDay}>{moment(item.holiday_date).format("DD")}</Text>
                    <Text style={styles.dateMonth}>{moment(item.holiday_date).format("MMM")}</Text>
                </View>
                <View style={styles.detailsBox}>
                    <Text style={styles.holidayName} numberOfLines={1}>{item.holiday_name}</Text>
                    <View style={styles.tagRow}>
                        <Chip
                            mode="outlined"
                            style={styles.typeChip}
                            textStyle={[styles.typeChipText, { color: getTypeColor(item.holiday_type) }]}
                        >
                            {item.holiday_type.toUpperCase()}
                        </Chip>
                        <Text style={styles.yearText}>{moment(item.holiday_date).format("dddd, YYYY")}</Text>
                    </View>
                </View>
                <View style={styles.actionBox}>
                    <IconButton icon="pencil" size={20} iconColor="#64748B" onPress={() => openModal(item)} />
                    <IconButton icon="delete" size={20} iconColor="#F44336" onPress={() => handleDelete(item.id)} />
                </View>
            </View>
        </Surface>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#5E72EB" />

                {/* Header */}
                <LinearGradient colors={["#5E72EB", "#4A62E0"]} style={styles.header}>
                    <View style={styles.headerToolbar}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}> School Holidays</Text>

                        {/* Year Filter */}
                        <View style={styles.filterContainer}>
                            <Dropdown
                                style={styles.dropdown}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                data={yearOptions}
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                value={selectedYear}
                                onChange={item => setSelectedYear(item.value)}
                                renderRightIcon={() => (
                                    <MaterialCommunityIcons name="calendar-filter" size={20} color="white" />
                                )}
                            />
                        </View>
                    </View>

                    {/* Search Bar */}
                    <Searchbar
                        placeholder="Search Holidays..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        inputStyle={styles.searchInput}
                        iconColor="#5E72EB"
                    />
                </LinearGradient>

                {/* List */}
                <View style={styles.contentContainer}>
                    <FlatList
                        data={filteredHolidays}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="calendar-remove" size={60} color="#CBD5E1" />
                                <Text style={styles.emptyText}>No holidays found</Text>
                            </View>
                        }
                    />
                </View>

                {/* FAB */}
                <FAB
                    style={styles.fab}
                    icon="plus"
                    color="white"
                    label="Add Holiday"
                    onPress={() => openModal()}
                />

                {/* Modal */}
                <Portal>
                    <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>{isEditing ? "Edit Holiday" : "Add New Holiday"}</Text>

                        <TextInput
                            label="Holiday Name"
                            value={formData.holiday_name}
                            onChangeText={(text) => setFormData({ ...formData, holiday_name: text })}
                            mode="outlined"
                            style={styles.input}
                            outlineColor="#E2E8F0"
                            activeOutlineColor="#5E72EB"
                        />

                        <Text style={styles.label}>Holiday Date</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerBtn}>
                            <Text style={styles.dateText}>
                                {moment(formData.holiday_date).format("DD MMM YYYY")}
                            </Text>
                            <MaterialCommunityIcons name="calendar" size={24} color="#64748B" />
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={formData.holiday_date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onChangeDate}
                                minimumDate={new Date(2020, 0, 1)}
                            />
                        )}

                        <Text style={styles.label}>Holiday Type</Text>
                        <View style={styles.typeContainer}>
                            {holidayTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[
                                        styles.typeBtn,
                                        formData.holiday_type === type.value && { backgroundColor: '#EEF2FF', borderColor: '#5E72EB' }
                                    ]}
                                    onPress={() => setFormData({ ...formData, holiday_type: type.value })}
                                >
                                    <View style={[styles.radioCircle, formData.holiday_type === type.value && styles.radioSelected]} />
                                    <Text style={[
                                        styles.typeText,
                                        formData.holiday_type === type.value && { color: '#5E72EB', fontWeight: 'bold' }
                                    ]}>{type.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalActions}>
                            <Button mode="outlined" onPress={closeModal} style={styles.actionBtn}>Cancel</Button>
                            <Button mode="contained" onPress={handleSave} style={styles.actionBtn} buttonColor="#5E72EB">Save</Button>
                        </View>
                    </Modal>
                </Portal>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 30, // Compacted
        paddingBottom: 20, // Compacted
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20, // Compacted
        borderBottomRightRadius: 20, // Compacted
    },
    headerToolbar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10, // Compacted
    },
    headerTitle: {
        fontSize: 18, // Compacted
        fontWeight: "bold",
        color: "white",
        flex: 1,
        marginLeft: 15
    },
    backButton: {
        padding: 6, // Compacted
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10
    },
    filterContainer: {
        width: 100,
    },
    dropdown: {
        height: 35, // Compacted
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    placeholderStyle: {
        fontSize: 13, // Compacted
        color: 'white',
    },
    selectedTextStyle: {
        fontSize: 13, // Compacted
        color: 'white',
        fontWeight: 'bold'
    },
    searchBar: {
        borderRadius: 10,
        backgroundColor: 'white',
        height: 40, // Compacted
        elevation: 2
    },
    searchInput: {
        minHeight: 0,
        fontSize: 14 // Compacted
    },
    contentContainer: {
        flex: 1,
        marginTop: 10,
        paddingHorizontal: 15 // Compacted
    },
    listContent: {
        paddingBottom: 80
    },
    card: {
        backgroundColor: 'white',
        marginBottom: 10, // Compacted
        borderRadius: 10,
        overflow: 'hidden',
        flexDirection: 'row',
        height: 75 // Compacted
    },
    colorStrip: {
        width: 5, // Compacted
        height: '100%'
    },
    cardContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12 // Compacted
    },
    dateBox: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        width: 45, // Compacted
        height: 45, // Compacted
        marginRight: 12
    },
    dateDay: {
        fontSize: 16, // Compacted
        fontWeight: 'bold',
        color: '#334155'
    },
    dateMonth: {
        fontSize: 9, // Compacted
        color: '#64748B',
        textTransform: 'uppercase'
    },
    detailsBox: {
        flex: 1,
    },
    holidayName: {
        fontSize: 15, // Compacted
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 2
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    typeChip: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 20, // Compacted
        alignItems: 'center'
    },
    typeChipText: {
        fontSize: 9, // Compacted
        marginVertical: -6,
        marginHorizontal: -4
    },
    yearText: {
        fontSize: 11, // Compacted
        color: '#94A3B8'
    },
    actionBox: {
        flexDirection: 'row',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50
    },
    emptyText: {
        color: '#94A3B8',
        marginTop: 10
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 50,
        backgroundColor: '#F4511E',
        borderRadius: 30
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 16
    },
    modalTitle: {
        fontSize: 18, // Compacted
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1E293B',
        textAlign: 'center'
    },
    input: {
        marginBottom: 10, // Compacted
        backgroundColor: 'white'
    },
    label: {
        fontSize: 13, // Compacted
        color: '#64748B',
        marginBottom: 5,
        marginTop: 5
    },
    datePickerBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 10, // Compacted
        borderRadius: 8,
        marginBottom: 10
    },
    dateText: {
        fontSize: 14, // Compacted
        color: '#334155'
    },
    typeContainer: {
        gap: 8,
        marginBottom: 20
    },
    typeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10, // Compacted
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
    },
    radioCircle: {
        width: 16, // Compacted
        height: 16, // Compacted
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        marginRight: 10
    },
    radioSelected: {
        borderColor: '#5E72EB',
        borderWidth: 4
    },
    typeText: {
        fontSize: 13, // Compacted
        color: '#475569'
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15
    },
    actionBtn: {
        flex: 1,
        borderRadius: 8
    }
});

export default SchoolHoliday;
