import React, { useState, useEffect, useLayoutEffect } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    StatusBar,
    Image,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    TouchableOpacity
} from "react-native";
import { Text, Surface, Divider, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const { width } = Dimensions.get('window');

const TeacherProfile = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [teacher, setTeacher] = useState(null);

    const backendUrl = Constants.expoConfig.extra.backendUrl;
    const userImageBaseUrl = Constants.expoConfig.extra.userImageBaseUrl;

    useLayoutEffect(() => {
        navigation.getParent()?.setOptions({
            title: "My Profile",
        });
    }, [navigation]);

    const fetchMyProfile = async () => {
        if (!user?.id) return;

        try {
            // Since we don't have a direct 'getTeacherByUserId' endpoint documented, 
            // we'll fetch all and filter. This is a fallback strategy.
            // Ideally: await axios.get(`${backendUrl}teachers/user/${user.id}`);
            const response = await axios.get(`${backendUrl}getAllTeachers`);

            if (response.data && response.data.teachers) {
                const myProfile = response.data.teachers.find(t => t.user_id === user.id);
                if (myProfile) {
                    setTeacher(myProfile);
                } else {
                    console.warn("Teacher profile not found for user ID:", user.id);
                }
            }
        } catch (error) {
            console.error("Error fetching teacher profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProfile();
    }, [user?.id]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchMyProfile();
        setRefreshing(false);
    }, []);

    const DetailRow = ({ icon, label, value, isLast }) => (
        <View style={[styles.detailRow, isLast && styles.noBorder]}>
            <View style={styles.detailIconBox}>
                <MaterialCommunityIcons name={icon} size={18} color="#5E72EB" />
            </View>
            <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value || "Not Provided"}</Text>
            </View>
        </View>
    );

    const SectionCard = ({ title, icon, children }) => (
        <Surface style={styles.card} elevation={2}>
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderIcon}>
                    <MaterialCommunityIcons name={icon} size={20} color="#fff" />
                </View>
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            <View style={styles.cardBody}>
                {children}
            </View>
        </Surface>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5E72EB" />
                <Text style={styles.loadingText}>Loading Profile...</Text>
            </View>
        );
    }

    if (!teacher) {
        return (
            <View style={styles.errorContainer}>
                <StatusBar barStyle="dark-content" backgroundColor="#f4f7fc" />
                <MaterialCommunityIcons name="account-search-outline" size={64} color="#94A3B8" />
                <Text style={styles.errorText}>Profile Not Found</Text>
                <Text style={styles.errorSubText}>Your teacher profile matches could not be found.</Text>
                <Button mode="contained" onPress={fetchMyProfile} style={{ marginTop: 20 }} buttonColor="#5E72EB">
                    Retry
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5E72EB" />

            {/* Custom Header with Curve */}
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={["#5E72EB", "#4A62E0"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerToolbar}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>My Profile</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.profileHeaderContent}>
                        <View style={styles.avatarContainer}>
                            {teacher.profile_photo ? (
                                <Image
                                    source={{ uri: `${userImageBaseUrl}${teacher.profile_photo}` }}
                                    style={styles.profileImage}
                                />
                            ) : (
                                <View style={[styles.profileImage, styles.placeholderImage]}>
                                    <Text style={styles.initialsText}>
                                        {teacher.user?.name ? teacher.user.name.substring(0, 2).toUpperCase() : "TP"}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.activeBadge} />
                        </View>

                        <Text style={styles.nameText}>{teacher.user?.name || "Teacher"}</Text>
                        <Text style={styles.roleText}>{teacher.qualification} • {teacher.experience_years || 0} Years Exp.</Text>

                        <View style={styles.idBadge}>
                            <Text style={styles.idText}>ID: {teacher.id}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Contact Information */}
                <SectionCard title="Contact Information" icon="card-account-phone-outline">
                    <DetailRow icon="phone" label="Mobile Number" value={teacher.user?.mobile} />
                    <DetailRow icon="email-outline" label="Email Address" value={teacher.user?.email} />
                    <DetailRow icon="map-marker-radius-outline" label="Address" value={teacher.address} isLast />
                </SectionCard>

                {/* Personal Information */}
                <SectionCard title="Personal Details" icon="account-details-outline">
                    <DetailRow icon="cake-variant-outline" label="Date of Birth" value={teacher.dob ? new Date(teacher.dob).toLocaleDateString() : null} />
                    <DetailRow icon="human-male-female" label="Gender" value={teacher.gender} />
                    <DetailRow icon="calendar-account-outline" label="Joining Date" value={teacher.joining_date ? new Date(teacher.joining_date).toLocaleDateString() : null} />
                    <DetailRow icon="card-account-details-outline" label="Aadhar Number" value={teacher.aadhar_number} isLast />
                </SectionCard>

                {/* Assigned Classes */}
                <Surface style={styles.card} elevation={2}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.cardHeaderIcon, { backgroundColor: '#F59E0B' }]}>
                            <MaterialCommunityIcons name="google-classroom" size={20} color="#fff" />
                        </View>
                        <Text style={styles.cardTitle}>Assigned Classes</Text>
                    </View>
                    <View style={styles.classContainer}>
                        {teacher.classes && teacher.classes.length > 0 ? (
                            teacher.classes.map((cls, index) => (
                                <View key={index} style={styles.classBadgeItem}>
                                    <View style={styles.classIcon}>
                                        <MaterialCommunityIcons name="book-open-variant" size={12} color="#4F46E5" />
                                    </View>
                                    <Text style={styles.classText}>
                                        {cls.class?.class_name || cls.class_name || `Class ${cls.class_id}`}
                                    </Text>
                                    {cls.academic_session && (
                                        <Text style={styles.sessionText}>
                                            ({cls.academic_session.session_name || 'Session'})
                                        </Text>
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No classes assigned yet.</Text>
                        )}
                    </View>
                </Surface>

                {/* Documents */}
                <Surface style={styles.card} elevation={2}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.cardHeaderIcon, { backgroundColor: '#10B981' }]}>
                            <MaterialCommunityIcons name="file-document-outline" size={20} color="#fff" />
                        </View>
                        <Text style={styles.cardTitle}>Documents</Text>
                    </View>
                    <View style={styles.docsContainer}>
                        <View style={styles.docItem}>
                            <View style={[styles.docIcon, teacher.aadhar_copy ? styles.docIconActive : styles.docIconInactive]}>
                                <MaterialCommunityIcons name="card-bulleted-outline" size={24} color={teacher.aadhar_copy ? "#5E72EB" : "#94A3B8"} />
                            </View>
                            <Text style={styles.docLabel}>Aadhar Card</Text>
                            <Text style={[styles.docStatus, { color: teacher.aadhar_copy ? '#10B981' : '#EF4444' }]}>
                                {teacher.aadhar_copy ? "Uploaded" : "Missing"}
                            </Text>
                        </View>

                        <View style={styles.docItem}>
                            <View style={[styles.docIcon, teacher.qualification_certificate ? styles.docIconActive : styles.docIconInactive]}>
                                <MaterialCommunityIcons name="certificate-outline" size={24} color={teacher.qualification_certificate ? "#5E72EB" : "#94A3B8"} />
                            </View>
                            <Text style={styles.docLabel}>Certificate</Text>
                            <Text style={[styles.docStatus, { color: teacher.qualification_certificate ? '#10B981' : '#EF4444' }]}>
                                {teacher.qualification_certificate ? "Uploaded" : "Missing"}
                            </Text>
                        </View>
                    </View>
                </Surface>

                <View style={{ height: 30 }} />
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#F1F5F9",
    },
    loadingText: {
        marginTop: 10,
        color: '#64748B',
        fontWeight: '500'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: "#F1F5F9"
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#334155',
        marginTop: 16
    },
    errorSubText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20
    },

    // Header
    headerContainer: {
        marginBottom: 0,
    },
    headerGradient: {
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
        paddingBottom: 40,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerToolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 20
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff'
    },
    profileHeaderContent: {
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 12,
        position: 'relative',
        elevation: 8,
        shadowColor: 'rgba(0,0,0,0.5)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#fff',
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center'
    },
    placeholderImage: {
        backgroundColor: '#F8FAFC'
    },
    initialsText: {
        fontSize: 36,
        fontWeight: '700',
        color: '#5E72EB'
    },
    activeBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#10B981',
        borderWidth: 3,
        borderColor: '#fff'
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
        textAlign: 'center'
    },
    roleText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 12,
        fontWeight: '500'
    },
    idBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)'
    },
    idText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5
    },

    // ScrollView
    scrollView: {
        flex: 1,
        marginTop: -30,
        zIndex: 10
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40
    },

    // Cards
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#FAFAFA'
    },
    cardHeaderIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#5E72EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155'
    },
    cardBody: {
        padding: 16
    },

    // Details
    detailRow: {
        flexDirection: 'row',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        alignItems: 'center'
    },
    noBorder: {
        borderBottomWidth: 0,
        marginBottom: 0,
        paddingBottom: 0
    },
    detailIconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14
    },
    detailContent: {
        flex: 1
    },
    detailLabel: {
        fontSize: 11,
        color: '#64748B',
        marginBottom: 2,
        textTransform: 'uppercase',
        fontWeight: '600',
        letterSpacing: 0.5
    },
    detailValue: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '500'
    },

    // Classes
    classContainer: {
        padding: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10
    },
    classBadgeItem: {
        backgroundColor: '#EEF2FF',
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#C7D2FE',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    classIcon: {
        display: 'none' // Hide for cleaner look or keep if desired
    },
    classText: {
        color: '#4338CA',
        fontWeight: '600',
        fontSize: 13
    },
    sessionText: {
        color: '#6366F1',
        fontSize: 11
    },
    emptyText: {
        color: '#94A3B8',
        fontSize: 13,
        fontStyle: 'italic',
        textAlign: 'center',
        width: '100%',
        paddingVertical: 10
    },

    // Docs
    docsContainer: {
        flexDirection: 'row',
        padding: 20,
        justifyContent: 'space-around'
    },
    docItem: {
        alignItems: 'center'
    },
    docIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#F1F5F9'
    },
    docIconActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#C7D2FE'
    },
    docIconInactive: {
        backgroundColor: '#F1F5F9',
        borderColor: '#E2E8F0',
        opacity: 0.7
    },
    docLabel: {
        fontSize: 12,
        color: '#475569',
        marginBottom: 2,
        fontWeight: '500'
    },
    docStatus: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase'
    }

});

export default TeacherProfile;