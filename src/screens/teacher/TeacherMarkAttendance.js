import React, { useState, useEffect, useLayoutEffect } from "react";
import {
    View,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    Alert,
    Dimensions, Platform
} from "react-native";
import { Text, Surface, ActivityIndicator, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import axios from "axios";
import Constants from "expo-constants";
import { useAuth } from "../../context/AuthContext";
import Toast from "react-native-toast-message";
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';


const { width } = Dimensions.get('window');

const TeacherMarkAttendance = ({ navigation }) => {
    const { user } = useAuth();
    const backendUrl = Constants.expoConfig.extra.backendUrl;

    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [attendanceData, setAttendanceData] = useState(null);
    const [currentTime, setCurrentTime] = useState(moment().format("hh:mm:ss A"));

    useLayoutEffect(() => {
        navigation.getParent()?.setOptions({
            headerShown: false,
        });
        // We'll manage our own header
    }, [navigation]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(moment().format("hh:mm:ss A"));
        }, 1000);

        fetchTodayAttendance();

        return () => clearInterval(timer);
    }, []);

    const fetchTodayAttendance = async () => {
        try {
            setLoading(true);
            // Fetch today's attendance status from the backend
            const response = await axios.get(`${backendUrl}teacher-attendance/today/${user.id}?attendance_date=${moment().format("YYYY-MM-DD")}`);

            // console.log("Today's Attendance Fetch:", response.data);
            // debugger;
            if (response.data && response.data.status && response.data.attendance) {
                // If record exists, set the attendance data to update UI state
                setAttendanceData({
                    in_time: response.data.attendance.in_time,
                    out_time: response.data.attendance.out_time,
                    status: response.data.attendance.status
                });
            } else {
                // No record found for today implies the teacher has not checked in yet
                setAttendanceData(null);
            }
        } catch (error) {
            // console.error("Error fetching attendance status:", error);
            // If request fails (e.g. 404 or network), assume no data so user can try to check in
            setAttendanceData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceAction = async (type) => {
        // type: 'in' or 'out'
        if (marking) return;

        try {
            setMarking(true);
            const todayStr = moment().format("YYYY-MM-DD");
            const timeStr = moment().format("HH:mm:ss");
            // debugger;
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                // setErrorMsg('Permission denied');
                const { status, canAskAgain } =
                    await Location.requestForegroundPermissionsAsync();

                // जर permission नसेल
                if (status !== "granted") {
                    Alert.alert(
                        "Location Permission Required 📍",
                        "Attendance mark करण्यासाठी location access आवश्यक आहे. कृपया allow करा.",
                        [
                            {
                                text: "Cancel",
                                style: "cancel",
                            },
                            // परत permission मागू शकतो
                            canAskAgain
                                ? {
                                    text: "Allow",
                                    onPress: () => requestLocationPermission(),
                                }
                                : {
                                    text: "Open Settings",
                                    onPress: () => {
                                        if (Platform.OS === "ios") {
                                            Linking.openURL("app-settings:");
                                        } else {
                                            Linking.openSettings();
                                        }
                                    },
                                },
                        ]
                    );
                    return false;
                }


                return;
            }

            // Get location
            let loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });


            const payload = {
                user_id: user.id, // Assuming user.id maps to teacher_id or we need to find it
                attendance_date: todayStr,
                [type === 'in' ? 'in_time' : 'out_time']: timeStr,
                status: 'present',
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            };
            // debugger;

            // FIXME: Replace with actual endpoint 
            await axios.post(`${backendUrl}teacher-attendance/mark`, payload);

            // Mock success
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (type === 'in') {
                setAttendanceData({
                    in_time: timeStr,
                    out_time: null,
                    status: 'present'
                });
                // Alert.alert("Success", "Checked In Successfully at " + moment().format("hh:mm A"));

                Toast.show({
                    type: 'success',
                    text1: 'Checked In Successfully',
                    text2: 'at ' + moment().format("hh:mm A")
                });
            } else {
                setAttendanceData(prev => ({
                    ...prev,
                    out_time: timeStr
                }));
                // Alert.alert("Success", "Checked Out Successfully at " + moment().format("hh:mm A"));

                Toast.show({
                    type: 'success',
                    text1: 'Checked Out Successfully',
                    text2: 'at ' + moment().format("hh:mm A")
                });

            }

        } catch (error) {
            console.error("Error marking attendance:", error);
            Alert.alert("Error", "Failed to mark attendance. Please try again.");
        } finally {
            setMarking(false);
        }
    };

    const StatusCard = ({ label, value, icon, color }) => (
        <Surface style={styles.statusCard} elevation={2}>
            <View style={[styles.statusIconContainer, { backgroundColor: `${color}20` }]}>
                <MaterialCommunityIcons name={icon} size={24} color={color} />
            </View>
            <View>
                <Text style={styles.statusLabel}>{label}</Text>
                <Text style={styles.statusValue}>{value || "--:--"}</Text>
            </View>
        </Surface>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#5E72EB" />
            </View>
        );
    }

    const isCheckedIn = attendanceData?.in_time;
    const isCheckedOut = attendanceData?.out_time;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5E72EB" />

            {/* Header */}
            <LinearGradient colors={["#5E72EB", "#4A62E0"]} style={styles.header}>
                <View style={styles.headerToolbar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Attendance</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.headerInfo}>
                    <Text style={styles.dateText}>{moment().format("dddd, D MMMM YYYY")}</Text>
                    <Text style={styles.clockText}>{currentTime}</Text>
                </View>
            </LinearGradient>

            <View style={styles.contentContainer}>
                {/* Main Action Circle */}
                <View style={styles.actionContainer}>
                    {!isCheckedIn ? (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.checkInBtn]}
                            onPress={() => handleAttendanceAction('in')}
                            activeOpacity={0.8}
                            disabled={marking}
                        >
                            <LinearGradient colors={["#4CAF50", "#45a049"]} style={styles.gradientBtn}>
                                {marking ? (
                                    <ActivityIndicator color="white" size="large" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="fingerprint" size={64} color="white" />
                                        <Text style={styles.actionBtnText}>CHECK IN</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : !isCheckedOut ? (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.checkOutBtn]}
                            onPress={() => handleAttendanceAction('out')}
                            activeOpacity={0.8}
                            disabled={marking}
                        >
                            <LinearGradient colors={["#FF5722", "#F4511E"]} style={styles.gradientBtn}>
                                {marking ? (
                                    <ActivityIndicator color="white" size="large" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="logout" size={64} color="white" />
                                        <Text style={styles.actionBtnText}>CHECK OUT</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.completedContainer}>
                            <MaterialCommunityIcons name="check-circle" size={80} color="#4CAF50" />
                            <Text style={styles.completedText}>Attendance Completed</Text>
                            <Text style={styles.completedSubText}>You have marked today's activity.</Text>
                        </View>
                    )}
                </View>

                {/* Status Cards */}
                <View style={styles.statusRow}>
                    <StatusCard
                        label="Check In"
                        value={attendanceData?.in_time ? moment(attendanceData.in_time, "HH:mm:ss").format("hh:mm A") : "--:--"}
                        icon="login"
                        color="#4CAF50"
                    />
                    <StatusCard
                        label="Check Out"
                        value={attendanceData?.out_time ? moment(attendanceData.out_time, "HH:mm:ss").format("hh:mm A") : "--:--"}
                        icon="logout"
                        color="#FF5722"
                    />
                </View>

                {/* Quick Links */}
                <Text style={styles.sectionTitle}>Quick Links</Text>

                <TouchableOpacity
                    style={styles.linkItem}
                    onPress={() => navigation.navigate("TeacherAttendance", { teacherId: user.id })} // Navigate to history
                >
                    <View style={styles.linkLeft}>
                        <View style={[styles.linkIconBox, { backgroundColor: '#E3F2FD' }]}>
                            <MaterialCommunityIcons name="calendar-month" size={24} color="#2196F3" />
                        </View>
                        <View>
                            <Text style={styles.linkTitle}>View Monthly Attendance</Text>
                            <Text style={styles.linkSubtitle}>Check your past records</Text>
                        </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#BDBDBD" />
                </TouchableOpacity>

                {/* Additional Placeholder Link */}
                <TouchableOpacity style={styles.linkItem}>
                    <View style={styles.linkLeft}>
                        <View style={[styles.linkIconBox, { backgroundColor: '#F3E5F5' }]}>
                            <MaterialCommunityIcons name="file-document-outline" size={24} color="#9C27B0" />
                        </View>
                        <View>
                            <Text style={styles.linkTitle}>Apply for Leave</Text>
                            <Text style={styles.linkSubtitle}>Request leave application</Text>
                        </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#BDBDBD" />
                </TouchableOpacity>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#F8FAFC",
    },
    header: {
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
        paddingBottom: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerToolbar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "white",
    },
    headerInfo: {
        alignItems: 'center',
    },
    dateText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
        marginBottom: 5
    },
    clockText: {
        fontSize: 32,
        color: 'white',
        fontWeight: 'bold',
        letterSpacing: 1
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: -30,
    },
    actionContainer: {
        alignItems: 'center',
        marginBottom: 30,
        height: 200, // Fixed height space for button
        justifyContent: 'center'
    },
    actionBtn: {
        width: 180,
        height: 180,
        borderRadius: 90,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        backgroundColor: 'white', // fallback
    },
    gradientBtn: {
        flex: 1,
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'white'
    },
    actionBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        letterSpacing: 1
    },
    completedContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        elevation: 2,
        width: '100%',
    },
    completedText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginTop: 10
    },
    completedSubText: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 5
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
        marginBottom: 30
    },
    statusCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    statusIconContainer: {
        width: 45,
        height: 45,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    statusLabel: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 2
    },
    statusValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B'
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 15,
        marginLeft: 5
    },
    linkItem: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
    },
    linkLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    linkIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    linkTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 2
    },
    linkSubtitle: {
        fontSize: 12,
        color: '#94A3B8'
    }
});

export default TeacherMarkAttendance;
