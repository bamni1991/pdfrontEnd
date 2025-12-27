import React, { useState, useEffect, useLayoutEffect } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    StatusBar,
    Image,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import {
    Text,
    Button,
    Divider
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import axios from "axios";

const StudentDetails = ({ route, navigation }) => {

    useLayoutEffect(() => {
        navigation.getParent()?.setOptions({
            title: "Student Details",
        });
    }, [navigation]);

    const { studentId } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState(null);

    const backendUrl = Constants.expoConfig.extra.backendUrl;
    const userImageBaseUrl = Constants.expoConfig.extra.userImageBaseUrl;

    useEffect(() => {
        if (studentId) {
            fetchStudentDetails();
        }
    }, [studentId]);

    const fetchStudentDetails = async () => {
        try {
            const response = await axios.get(`${backendUrl}student/${studentId}`);

            if (response.data && response.data.status === 'success') {
                setStudent(response.data.data);
            } else if (response.data && response.data.data) {
                setStudent(response.data.data);
            } else {
                setStudent(response.data);
            }
        } catch (error) {
            console.error("Error fetching student details:", error);
        } finally {
            setLoading(false);
        }
    };

    const DetailItem = ({ icon, label, value, isFullWidth = false }) => (
        <View style={[styles.detailItem, isFullWidth ? styles.fullWidthItem : styles.halfWidthItem]}>
            <View style={styles.detailHeader}>
                <MaterialCommunityIcons name={icon} size={14} color="#5E72EB" style={styles.detailIcon} />
                <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>{value || "N/A"}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5E72EB" />
                <Text style={styles.loadingText}>Loading Profile...</Text>
            </View>
        );
    }

    if (!student) {
        return (
            <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#ccc" />
                <Text style={styles.errorText}>Student data not found</Text>
                <Button mode="contained" onPress={() => navigation.goBack()} buttonColor="#5E72EB">
                    Go Back
                </Button>
            </View>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-GB");
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5E72EB" />

            {/* Header with gradient */}
            <LinearGradient colors={["#5E72EB", "#4a5edb"]} style={styles.header}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        {student.photo ? (
                            <Image
                                source={{ uri: `${userImageBaseUrl}${student.photo}` }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={[styles.profileImage, styles.placeholderImage]}>
                                <Text style={styles.initialsText}>
                                    {student.student_name ? student.student_name.substring(0, 2).toUpperCase() : "ST"}
                                </Text>
                            </View>
                        )}
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>Active</Text>
                        </View>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.studentNameHeader} numberOfLines={1}>{student.student_name}</Text>
                        <Text style={styles.studentSubtitle}>Student ID: {student.id}</Text>
                        <View style={styles.badgeRow}>
                            <View style={styles.classBadge}>
                                <MaterialCommunityIcons name="school" size={10} color="white" />
                                <Text style={styles.classBadgeText}>{student.className}</Text>
                            </View>
                            <View style={styles.sessionBadge}>
                                <MaterialCommunityIcons name="calendar" size={10} color="#5E72EB" />
                                <Text style={styles.sessionBadgeText}>{student.academicSession}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="calendar-check" size={18} color="#5E72EB" />
                        <Text style={styles.statValue}>{formatDate(student.admissionDate)}</Text>
                        <Text style={styles.statLabel}>Adm. Date</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="cake-variant" size={18} color="#5E72EB" />
                        <Text style={styles.statValue}>{formatDate(student.dob)}</Text>
                        <Text style={styles.statLabel}>DOB</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="phone" size={18} color="#5E72EB" />
                        <Text style={styles.statValue}>{student.mobile1}</Text>
                        <Text style={styles.statLabel}>Contact</Text>
                    </View>
                </View>

                {/* Fees & Payments Action */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={styles.feesButton}
                        onPress={() => navigation.navigate('FeesDetails', {
                            studentId: student.id,
                            studentName: student.student_name,
                            className: student.className
                        })}
                    >
                        <View style={styles.feesButtonContent}>
                            <View style={styles.feesIconContainer}>
                                <MaterialCommunityIcons name="cash-multiple" size={20} color="white" />
                            </View>
                            <View style={styles.feesTextContainer}>
                                <Text style={styles.feesTitle}>Fees & Payments</Text>
                                <Text style={styles.feesSubtitle}>View history and collect fees</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Personal Information */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <View style={styles.cardIconContainer}>
                                <MaterialCommunityIcons name="account" size={16} color="#5E72EB" />
                            </View>
                            <Text style={styles.cardTitle}>Personal Info</Text>
                        </View>
                    </View>
                    <View style={styles.cardContent}>
                        <DetailItem icon="human-male-female" label="Gender" value={student.gender} />
                        <DetailItem icon="map-marker" label="Birth Place" value={student.birthPlace} />
                        <DetailItem icon="earth" label="Nationality" value={student.nationalityName} />
                        <DetailItem icon="church" label="Religion" value={student.religionName} />
                        <DetailItem icon="account-group" label="Category" value={student.casteCategory} />
                        <DetailItem icon="translate" label="Tongue" value={student.motherTongue} />
                    </View>
                </View>

                {/* Family Details */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <View style={styles.cardIconContainer}>
                                <MaterialCommunityIcons name="home-heart" size={16} color="#5E72EB" />
                            </View>
                            <Text style={styles.cardTitle}>Family Info</Text>
                        </View>
                    </View>
                    <View style={styles.cardContent}>
                        <DetailItem icon="face-man" label="Father" value={student.father_name} />
                        <DetailItem icon="briefcase" label="Occupation" value={student.fatherOccupation} />
                        <DetailItem icon="face-woman" label="Mother" value={student.mother_name} />
                        <DetailItem icon="briefcase" label="Occupation" value={student.motherOccupation} />
                        <DetailItem icon="card-account-details" label="Father Aadhar" value={student.aadharNo} isFullWidth />
                    </View>
                </View>

                {/* Contact Details */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <View style={styles.cardIconContainer}>
                                <MaterialCommunityIcons name="phone" size={16} color="#5E72EB" />
                            </View>
                            <Text style={styles.cardTitle}>Contact Info</Text>
                        </View>
                    </View>
                    <View style={styles.cardContent}>
                        <DetailItem icon="phone" label="Primary Mobile" value={student.mobile1} />
                        <DetailItem icon="phone" label="Secondary Mobile" value={student.mobile2} />
                        <DetailItem icon="map-marker" label="State" value={student.stateName} />
                        <DetailItem icon="home" label="Address" value={student.address} isFullWidth />
                    </View>
                </View>

                {/* School Kit Details */}
                {student.kitItems && student.kitItems.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderLeft}>
                                <View style={styles.cardIconContainer}>
                                    <MaterialCommunityIcons name="bag-personal" size={16} color="#5E72EB" />
                                </View>
                                <Text style={styles.cardTitle}>School Kit Items</Text>
                            </View>
                        </View>
                        <View style={styles.cardContent}>
                            <View style={styles.kitContainer}>
                                {student.kitItems.map((item, index) => (
                                    <View key={index} style={styles.kitChip}>
                                        <MaterialCommunityIcons name="check-circle" size={14} color="#10B981" />
                                        <Text style={styles.kitChipText}>
                                            {typeof item === 'string' ? item : (item.name || item.item_name || "Kit Item")}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F1F5F9",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
        fontSize: 14,
        fontWeight: '500'
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
        backgroundColor: "#F1F5F9",
    },
    errorText: {
        fontSize: 16,
        color: "#666",
        marginTop: 12,
        marginBottom: 20,
        textAlign: 'center'
    },
    header: {
        paddingTop: Constants.statusBarHeight + 12,
        paddingBottom: 20,
        paddingHorizontal: 16,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: 'white',
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)'
    },
    initialsText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
    },
    statusBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#10B981',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: 'white',
    },
    statusText: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
    },
    headerInfo: {
        flex: 1,
    },
    studentNameHeader: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
        marginBottom: 2,
    },
    studentSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 6,
    },
    classBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 4,
    },
    classBadgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
    },
    sessionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 4,
    },
    sessionBadgeText: {
        color: '#5E72EB',
        fontSize: 11,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
        marginTop: -16,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 8,
    },
    statValue: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 4,
        textAlign: 'center',
    },
    statLabel: {
        fontSize: 10,
        color: '#6B7280',
        marginTop: 2,
        textAlign: 'center',
    },
    actionContainer: {
        marginBottom: 12,
    },
    feesButton: {
        backgroundColor: '#5E72EB',
        borderRadius: 12,
        padding: 0,
        elevation: 2,
        shadowColor: '#5E72EB',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    feesButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    feesIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    feesTextContainer: {
        flex: 1,
    },
    feesTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
    },
    feesSubtitle: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 1,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    cardContent: {
        padding: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    detailItem: {
        marginBottom: 10,
    },
    halfWidthItem: {
        width: '50%',
        paddingRight: 8,
    },
    fullWidthItem: {
        width: '100%',
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    detailIcon: {
        marginRight: 6,
    },
    detailLabel: {
        fontSize: 10,
        color: '#6B7280',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    detailValue: {
        fontSize: 13,
        color: '#1F2937',
        fontWeight: '600',
        lineHeight: 18,
    },
    kitContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -2,
    },
    kitChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        margin: 2,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    kitChipText: {
        fontSize: 11,
        color: '#4B5563',
        fontWeight: '600',
        marginLeft: 4,
    },
});

export default StudentDetails;