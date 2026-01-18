import React, { useState, useEffect, useLayoutEffect } from "react";
import {
    View,
    StyleSheet,
    StatusBar,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Linking,
    Alert
} from "react-native";
import { Text, Surface, Modal, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import axios from "axios";
import Constants from "expo-constants";
import { Calendar } from "react-native-calendars";
import { useAuth } from "../../context/AuthContext";
import * as Location from 'expo-location';

const TeacherAttendance = ({ navigation, route }) => {
    const { user } = useAuth();
    const backendUrl = Constants.expoConfig.extra.backendUrl;

    const { teacherId, teacherName } = route.params || {};
    const targetUserId = teacherId ? teacherId : user.id;

    const [loading, setLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(moment().format("YYYY-MM-DD"));
    const [markedDates, setMarkedDates] = useState({});

    // Stats
    const [stats, setStats] = useState({
        present: 0,
        absent: 0,
        leave: 0,
        holiday: 0,
        weekly_off: 0
    });

    // Selected Date Details
    const [selectedDateDetails, setSelectedDateDetails] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    useEffect(() => {
        fetchMonthlyAttendance(currentMonth);
    }, [currentMonth]);

    const fetchMonthlyAttendance = async (monthDate) => {
        setLoading(true);
        try {
            const dateObj = moment(monthDate);
            const month = dateObj.format("MM");
            const year = dateObj.format("YYYY");

            const response = await axios.get(`${backendUrl}teacher-attendance/history/${targetUserId}?month=${month}&year=${year}`);

            const { attendance_list, stats: backendStats } = response.data;

            const newMarkedDates = {};

            if (attendance_list && Array.isArray(attendance_list)) {
                attendance_list.forEach(item => {
                    const dateStr = item.date;
                    let color = '#9E9E9E'; // Default gray
                    let type = item.status; // present, absent, holiday, etc.

                    // Parse coordinates if they come as JSON strings or arrays
                    let in_cordinate = item.in_cordinate;
                    let out_cordinate = item.out_cordinate;

                    switch (type) {
                        case 'present':
                            color = '#4CAF50';
                            break;
                        case 'absent':
                            color = '#F44336';
                            break;
                        case 'leave':
                            color = '#2196F3';
                            break;
                        case 'holiday':
                            color = '#FF9800';
                            break;
                        case 'weekly_off':
                            color = '#FFC107';
                            break;
                        default:
                            color = '#BDBDBD';
                    }

                    if (type !== '-' && type !== 'future') {
                        newMarkedDates[dateStr] = {
                            customStyles: {
                                container: { backgroundColor: color, elevation: 2 },
                                text: { color: 'white', fontWeight: 'bold' }
                            },
                            type: type,
                            note: item.note,
                            in_time: item.times?.in,
                            out_time: item.times?.out,
                            in_cordinate: in_cordinate,
                            out_cordinate: out_cordinate
                        };
                    }
                });
            }

            setMarkedDates(newMarkedDates);
            if (backendStats) {
                setStats(backendStats);
            }

        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const openMap = (lat, lng) => {
        if (!lat || !lng) {
            Alert.alert("Location Not Available", "Coordinates for this entry are not available.");
            return;
        }
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert("Error", "Don't know how to open URI: " + url);
            }
        });
    };

    const getAddress = async (coords) => {
        if (!coords) return null;
        try {
            const lat = coords.latitude || coords[0];
            const lng = coords.longitude || coords[1];

            // Check if lat/lng are valid numbers
            if (isNaN(lat) || isNaN(lng)) return "Invalid Coordinates";

            const addressResponse = await Location.reverseGeocodeAsync({ latitude: parseFloat(lat), longitude: parseFloat(lng) });

            if (addressResponse && addressResponse.length > 0) {
                const addr = addressResponse[0];
                // Construct a readable string
                // E.g. "Main St, Springfield, IL"
                const parts = [addr.street, addr.city, addr.region].filter(part => part);
                return parts.join(', ') || addr.name || "Unknown Location";
            }
        } catch (error) {
            console.log("Reverse Geocode Error", error);
        }
        return "Location not found";
    };

    const onDayPress = async (day) => {
        const data = markedDates[day.dateString];
        if (data) {
            // 1. Show modal immediately with loading state for addresses
            setSelectedDateDetails({
                date: day.dateString,
                ...data,
                in_address: data.in_cordinate ? "Locating..." : null,
                out_address: data.out_cordinate ? "Locating..." : null
            });
            setModalVisible(true);

            // 2. Fetch addresses in background
            let newInAddr = null;
            let newOutAddr = null;

            if (data.in_cordinate) {
                newInAddr = await getAddress(data.in_cordinate);
            }
            if (data.out_cordinate) {
                newOutAddr = await getAddress(data.out_cordinate);
            }

            // 3. Update state with found addresses (only if modal is still focused on same date theoretically, 
            // but user effect is fine here for simplicity)
            setSelectedDateDetails(prev => {
                if (prev && prev.date === day.dateString) {
                    return {
                        ...prev,
                        in_address: newInAddr,
                        out_address: newOutAddr
                    };
                }
                return prev;
            });
        }
    };

    const StatItem = ({ label, value, color, icon }) => (
        <View style={styles.statItem}>
            <View style={[styles.statIconBadge, { backgroundColor: `${color}20` }]}>
                <MaterialCommunityIcons name={icon} size={20} color={color} />
            </View>
            <View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5E72EB" />

            {/* Header */}
            <LinearGradient colors={["#5E72EB", "#4A62E0"]} style={styles.header}>
                <View style={styles.headerToolbar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{teacherName ? `${teacherName}'s Attendance` : "Monthly Report"}</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Stats Summary */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        <StatItem label="Present" value={stats.present} color="#4CAF50" icon="check-circle" />
                        <StatItem label="Absent" value={stats.absent} color="#F44336" icon="close-circle" />
                        <StatItem label="Leaves" value={stats.leave} color="#2196F3" icon="file-document" />
                    </View>
                    <View style={[styles.statsRow, { marginTop: 15 }]}>
                        <StatItem label="Holidays" value={stats.holiday} color="#FF9800" icon="calendar-star" />
                        <StatItem label="Week Offs" value={stats.weekly_off} color="#FFC107" icon="calendar-weekend" />
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <Surface style={styles.calendarCard} elevation={2}>
                    <Calendar
                        current={currentMonth}
                        onMonthChange={(month) => setCurrentMonth(month.dateString)}
                        markingType={'custom'}
                        markedDates={markedDates}
                        onDayPress={onDayPress}
                        theme={{
                            todayTextColor: '#5E72EB',
                            arrowColor: '#5E72EB',
                            monthTextColor: '#334155',
                            textMonthFontWeight: 'bold',
                            textDayHeaderWeight: 'bold'
                        }}
                    />
                </Surface>

                <View style={styles.legendContainer}>
                    <Text style={styles.legendTitle}>Keys</Text>
                    <View style={styles.legendRow}>
                        <LegendItem color="#4CAF50" label="Present" />
                        <LegendItem color="#F44336" label="Absent" />
                        <LegendItem color="#2196F3" label="Leave" />
                    </View>
                    <View style={styles.legendRow}>
                        <LegendItem color="#FF9800" label="Holiday" />
                        <LegendItem color="#FFC107" label="Weekly Off" />
                    </View>
                </View>
            </ScrollView>

            {/* Details Modal */}
            <Modal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                contentContainerStyle={styles.modalContent}
            >
                {selectedDateDetails && (
                    <View>
                        <View style={[styles.modalHeader, { backgroundColor: selectedDateDetails.customStyles.container.backgroundColor }]}>
                            <Text style={styles.modalDate}>
                                {moment(selectedDateDetails.date).format("dddd, D MMMM YYYY")}
                            </Text>
                            <Text style={styles.modalStatus}>
                                {selectedDateDetails.type.toUpperCase().replace('_', ' ')}
                            </Text>
                        </View>

                        <View style={styles.modalBody}>
                            {(selectedDateDetails.type === 'present' && selectedDateDetails.in_time) ? (
                                <View style={styles.timeInfo}>
                                    <View style={styles.timeBlock}>
                                        <Text style={styles.timeLabel}>In Time</Text>
                                        <Text style={styles.timeValue}>{selectedDateDetails.in_time}</Text>
                                        {selectedDateDetails.in_cordinate && (
                                            <TouchableOpacity onPress={() => openMap(selectedDateDetails.in_cordinate.latitude || selectedDateDetails.in_cordinate[0], selectedDateDetails.in_cordinate.longitude || selectedDateDetails.in_cordinate[1])}>
                                                <MaterialCommunityIcons name="map-marker-radius" size={20} color="#2196F3" style={{ marginTop: 5 }} />
                                            </TouchableOpacity>
                                        )}
                                        {selectedDateDetails.in_address && (
                                            <Text style={styles.addressText}>{selectedDateDetails.in_address}</Text>
                                        )}
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.timeBlock}>
                                        <Text style={styles.timeLabel}>Out Time</Text>
                                        <Text style={styles.timeValue}>{selectedDateDetails.out_time || '--:--'}</Text>
                                        {selectedDateDetails.out_cordinate && (
                                            <TouchableOpacity onPress={() => openMap(selectedDateDetails.out_cordinate.latitude || selectedDateDetails.out_cordinate[0], selectedDateDetails.out_cordinate.longitude || selectedDateDetails.out_cordinate[1])}>
                                                <MaterialCommunityIcons name="map-marker-radius" size={20} color="#2196F3" style={{ marginTop: 5 }} />
                                            </TouchableOpacity>
                                        )}
                                        {selectedDateDetails.out_address && (
                                            <Text style={styles.addressText}>{selectedDateDetails.out_address}</Text>
                                        )}
                                    </View>
                                </View>
                            ) : null}

                            {selectedDateDetails.note ? (
                                <View style={styles.noteBox}>
                                    <MaterialCommunityIcons name="information-outline" size={20} color="#64748B" />
                                    <Text style={styles.noteText}>{selectedDateDetails.note}</Text>
                                </View>
                            ) : null}

                            {selectedDateDetails.type === 'absent' && (
                                <Text style={styles.absentText}>No record found for this date.</Text>
                            )}

                            <Button
                                mode="contained"
                                onPress={() => setModalVisible(false)}
                                style={styles.closeBtn}
                                buttonColor="#334155"
                            >
                                Close
                            </Button>
                        </View>
                    </View>
                )}
            </Modal>
        </View>
    );
};

const LegendItem = ({ color, label }) => (
    <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text style={styles.legendText}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerToolbar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "white",
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12
    },
    statsContainer: {
        paddingHorizontal: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        minWidth: 100
    },
    statIconBadge: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white' // fallback
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white'
    },
    statLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)'
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: -30,
    },
    calendarCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 10,
        marginBottom: 20,
        overflow: 'hidden'
    },
    legendContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 30,
        elevation: 1
    },
    legendTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 10
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6
    },
    legendText: {
        fontSize: 12,
        color: '#64748B'
    },
    modalContent: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },
    modalHeader: {
        padding: 20,
        alignItems: 'center'
    },
    modalDate: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5
    },
    modalStatus: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: 1
    },
    modalBody: {
        padding: 20,
    },
    timeInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    timeBlock: {
        alignItems: 'center',
        flex: 1
    },
    timeLabel: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 4
    },
    timeValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#334155'
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: '#E2E8F0'
    },
    noteBox: {
        backgroundColor: '#F1F5F9',
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        marginBottom: 20
    },
    noteText: {
        color: '#475569',
        fontSize: 14,
        flex: 1
    },
    absentText: {
        textAlign: 'center',
        color: '#F44336',
        fontSize: 16,
        marginBottom: 20
    },
    addressText: {
        fontSize: 10,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 5,
        maxWidth: 120
    },
    closeBtn: {
        borderRadius: 10
    }
});

export default TeacherAttendance;
