import React, { useState, useEffect, useLayoutEffect } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    StatusBar,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    Linking,
    Platform,
    Alert,
    RefreshControl
} from "react-native";
import {
    Text,
    Button,
    Divider
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import Constants from "expo-constants";
import axios from "axios";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const TeacherDetails = ({ route, navigation }) => {





    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Teacher Details",
        });
    }, [navigation]);

    const { teacherId } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [teacher, setTeacher] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);

    const backendUrl = Constants.expoConfig.extra.backendUrl;
    const userImageBaseUrl = Constants.expoConfig.extra.userImageBaseUrl;

    const generatePDF = async () => {
        if (!teacher) return;

        setIsPrinting(true);
        try {
            const teacherPhoto = teacher.profile_photo ? `${userImageBaseUrl}${teacher.profile_photo}` : "https://via.placeholder.com/150";

            // Load local asset and convert to base64 or use URL
            let schoolLogo = userImageBaseUrl + "school_logo.png";

            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; }
        
        body { 
            font-family: 'Inter', sans-serif; 
            font-size: 11px; 
            line-height: 1.4; 
            color: #334155; 
            margin: 0; 
            padding: 20px; 
            background: #fff;
        }
        
        .wrapper { 
            width: 100%;
            max-width: 800px; 
            margin: 0 auto; 
            border: 1px solid #e2e8f0;
            padding: 30px; 
        }
        
        .header { 
            display: flex; 
            align-items: center; 
            border-bottom: 2px solid #5E72EB; 
            padding-bottom: 20px; 
            margin-bottom: 25px; 
        }
        
        .logo-img { 
            width: 80px; 
            height: 80px; 
            object-fit: contain; 
            margin-right: 20px;
        }
        
        .school-info { 
            flex: 1; 
        }
        
        .school-name { 
            font-size: 24px; 
            font-weight: 700; 
            color: #1e293b; 
            margin: 0 0 5px 0; 
            text-transform: uppercase; 
        }
        
        .school-address { 
            font-size: 11px; 
            color: #64748b; 
            margin: 0; 
        }
        
        .doc-title { 
            text-align: center; 
            margin-bottom: 25px; 
        }
        
        .doc-title span { 
            background: #5E72EB; 
            color: #fff; 
            padding: 6px 20px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: 600; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
        }
        
        .section { 
            margin-bottom: 20px; 
        }
        
        .section-header { 
            font-size: 12px; 
            font-weight: 700; 
            color: #5E72EB; 
            text-transform: uppercase; 
            border-bottom: 1px solid #cbd5e1; 
            padding-bottom: 5px; 
            margin-bottom: 12px; 
            letter-spacing: 0.5px;
        }
        
        .grid-container { 
            display: grid; 
            grid-template-columns: 1fr 140px; 
            gap: 20px; 
        }
        
        .info-table { 
            width: 100%; 
            border-collapse: collapse; 
        }
        
        .info-table td { 
            padding: 6px 0; 
            vertical-align: top; 
            border-bottom: 1px dashed #e2e8f0;
        }
        
        .info-table tr:last-child td {
            border-bottom: none;
        }
        
        .label { 
            width: 35%; 
            font-weight: 600; 
            color: #64748b; 
            font-size: 11px;
        }
        
        .value { 
            width: 65%; 
            font-weight: 500; 
            color: #0f172a; 
        }
        
        .photo-box { 
            width: 130px; 
            height: 150px; 
            border: 1px solid #cbd5e1; 
            background: #f1f5f9; 
            object-fit: cover; 
            border-radius: 8px; 
        }
        
        .col-2 { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 30px; 
        }
        
        .tags { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 8px; 
        }
        
        .tag { 
            background: #F1F5F9; 
            color: #334155; 
            padding: 4px 10px; 
            border-radius: 4px; 
            font-size: 11px; 
            font-weight: 500; 
            border: 1px solid #E2E8F0;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <img src="${schoolLogo}" class="logo-img" alt="Logo" />
            <div class="school-info">
                <h1 class="school-name">Padmavati Semi-English School</h1>
                <p class="school-address">Baliraja Market Main Road, Loha, Maharashtra 431708<br>Phone: 7721879878</p>
            </div>
        </div>

        <div class="doc-title">
            <span>Teacher Profile</span>
        </div>

        <!-- Main Profile Section -->
        <div class="section">
            <div class="grid-container">
                <div>
                    <div class="section-header">Basic Information</div>
                    <table class="info-table">
                        <tr>
                            <td class="label">Full Name</td>
                            <td class="value" style="font-size: 13px; font-weight: 700;">${teacher.user?.name || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">Teacher ID</td>
                            <td class="value">${teacher.id || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">Qualification</td>
                            <td class="value">${teacher.qualification || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">Joining Date</td>
                            <td class="value">${teacher.joining_date ? new Date(teacher.joining_date).toLocaleDateString() : '-'}</td>
                        </tr>
                         <tr>
                            <td class="label">Experience</td>
                            <td class="value">${teacher.experience_years || '0'} Years</td>
                        </tr>
                    </table>
                </div>
                <div>
                    <img src="${teacherPhoto}" class="photo-box" alt="Teacher Photo" />
                </div>
            </div>
        </div>

        <!-- Details Grid -->
        <div class="section">
            <div class="col-2">
                <div>
                    <div class="section-header">Personal Details</div>
                    <table class="info-table">
                         <tr>
                            <td class="label">Gender</td>
                            <td class="value">${teacher.gender || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">Date of Birth</td>
                            <td class="value">${teacher.dob ? new Date(teacher.dob).toLocaleDateString() : '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">Aadhar No.</td>
                            <td class="value">${teacher.aadhar_number || '-'}</td>
                        </tr>
                    </table>
                </div>
                <div>
                     <div class="section-header">Contact Details</div>
                     <table class="info-table">
                        <tr>
                            <td class="label">Mobile</td>
                            <td class="value">${teacher.user?.mobile || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">Email</td>
                            <td class="value">${teacher.user?.email || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">Address</td>
                            <td class="value">${teacher.address || '-'}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        <!-- Classes -->
        <div class="section">
            <div class="section-header">Assigned Classes</div>
            <div class="tags">
                ${teacher.classes && teacher.classes.length > 0 ? teacher.classes.map(cls => `
                    <div class="tag">
                       ${cls.class?.class_name || cls.class_name || "Class " + cls.class_id}
                    </div>
                `).join('') : '<span style="color:#94a3b8; font-style:italic;">No classes assigned</span>'}
            </div>
        </div>
        
    </div>
</body>
</html>
`;

            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            const fileName = `${teacher.user?.name ? teacher.user.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Teacher'}_Profile.pdf`;
            const newUri = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.moveAsync({ from: uri, to: newUri });

            if (Platform.OS === "ios") {
                await Sharing.shareAsync(newUri);
            } else {
                await Sharing.shareAsync(newUri, {
                    dialogTitle: 'Share Teacher Profile',
                    mimeType: 'application/pdf',
                    UTI: 'com.adobe.pdf'
                });
            }
        } catch (error) {
            console.error("PDF Generation Error:", error);
            Alert.alert("Error", `Failed to generate PDF: ${error.message}`);
        } finally {
            setIsPrinting(false);
        }
    };



    useEffect(() => {
        if (teacherId) {
            fetchTeacherDetails();
        }
    }, [teacherId]);

    const fetchTeacherDetails = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}teacher/${teacherId}`);
            debugger;
            // Ensure we handle data properly
            const teacherData = data.status ? data?.teacher : null;
            console.log(teacherData);

            if (teacherData) {
                setTeacher(teacherData);
            } else {
                Alert.alert("Error", "Teacher data not found found: " + (data.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Error fetching teacher details:", error);
            Alert.alert("Error", "Failed to fetch teacher details");
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchTeacherDetails();
        setRefreshing(false);
    }, []);

    const DetailItem = ({ icon, label, value, isFullWidth = false }) => (
        <View style={[styles.detailItem, isFullWidth ? styles.fullWidthItem : styles.halfWidthItem]}>
            <View style={styles.detailHeader}>
                <MaterialCommunityIcons name={icon} size={14} color="#5E72EB" style={styles.detailIcon} />
                <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={2}>{value || "N/A"}</Text>
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

    if (!teacher) {
        return (
            <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#ccc" />
                <Text style={styles.errorText}>Teacher data not found</Text>
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
                        {teacher.profile_photo ? (
                            <Image
                                source={{ uri: `${userImageBaseUrl}${teacher.profile_photo}` }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={[styles.profileImage, styles.placeholderImage]}>
                                <Text style={styles.initialsText}>
                                    {teacher.user?.name ? teacher.user.name.substring(0, 2).toUpperCase() : "TE"}
                                </Text>
                            </View>
                        )}
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>Active</Text>
                        </View>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.studentNameHeader} numberOfLines={1}>{teacher.user?.name}</Text>
                        <Text style={styles.studentSubtitle}>Teacher ID: {teacher.id}</Text>
                        <View style={styles.badgeRow}>
                            <View style={styles.classBadge}>
                                <MaterialCommunityIcons name="briefcase-outline" size={10} color="white" />
                                <Text style={styles.classBadgeText}>{teacher.qualification}</Text>
                            </View>
                            <View style={styles.sessionBadge}>
                                <MaterialCommunityIcons name="star-outline" size={10} color="#5E72EB" />
                                <Text style={styles.sessionBadgeText}>{teacher.experience_years || 0} Yrs Exp</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={generatePDF}
                        style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, marginLeft: 8 }}
                        disabled={isPrinting}
                    >
                        {isPrinting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <MaterialCommunityIcons name="printer" size={24} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="calendar-check" size={18} color="#5E72EB" />
                        <Text style={styles.statValue}>{formatDate(teacher.joining_date)}</Text>
                        <Text style={styles.statLabel}>Joined</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="cake-variant" size={18} color="#5E72EB" />
                        <Text style={styles.statValue}>{formatDate(teacher.dob)}</Text>
                        <Text style={styles.statLabel}>DOB</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="phone" size={18} color="#5E72EB" />
                        <Text style={styles.statValue}>{teacher.user?.mobile ? teacher.user.mobile.substring(0, 10) : 'N/A'}</Text>
                        <Text style={styles.statLabel}>Mobile</Text>
                    </View>
                </View>

                {/* Info Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <View style={styles.cardIconContainer}>
                                <MaterialCommunityIcons name="account" size={16} color="#5E72EB" />
                            </View>
                            <Text style={styles.cardTitle}>Personal Info</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('TeacherAdmission', { teacherId: teacher.id })}>
                            <MaterialCommunityIcons name="pencil-outline" size={20} color="#64748B" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.cardContent}>
                        <DetailItem icon="human-male-female" label="Gender" value={teacher.gender} />
                        <DetailItem icon="email-outline" label="Email" value={teacher.user?.email} isFullWidth />
                        <DetailItem icon="map-marker" label="Address" value={teacher.address} isFullWidth />
                        <DetailItem icon="card-account-details-outline" label="Aadhar No" value={teacher.aadhar_number} isFullWidth />
                    </View>
                </View>

                {/* Academics & Docs */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <View style={styles.cardIconContainer}>
                                <MaterialCommunityIcons name="school-outline" size={16} color="#5E72EB" />
                            </View>
                            <Text style={styles.cardTitle}>Professional Info</Text>
                        </View>
                    </View>
                    <View style={styles.cardContent}>
                        <DetailItem icon="certificate" label="Qualification" value={teacher.qualification} />
                        <DetailItem icon="briefcase-clock" label="Experience" value={teacher.experience_years ? teacher.experience_years + ' Years' : 'N/A'} />

                        {teacher.classes && teacher.classes.length > 0 && (
                            <View style={{ width: '100%', marginTop: 10 }}>
                                <Text style={[styles.detailLabel, { marginBottom: 5 }]}>Assigned Classes:</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                    {teacher.classes.map((cls, index) => (
                                        <View key={index} style={{ backgroundColor: '#EEF2FF', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: '#C7D2FE' }}>
                                            <Text style={{ fontSize: 12, color: '#4F46E5', fontWeight: '500' }}>
                                                {cls.class?.class_name || cls.class_name || "Class " + cls.class_id}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                <View style={[styles.card, { marginBottom: 40 }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <View style={styles.cardIconContainer}>
                                <MaterialCommunityIcons name="file-document-multiple-outline" size={16} color="#5E72EB" />
                            </View>
                            <Text style={styles.cardTitle}>Documents</Text>
                        </View>
                    </View>
                    <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-around' }}>
                        {teacher.aadhar_copy ? (
                            <TouchableOpacity onPress={() => Linking.openURL(userImageBaseUrl + teacher.aadhar_copy)} style={{ alignItems: 'center' }}>
                                <View style={{ width: 50, height: 50, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                                    <MaterialCommunityIcons name="card-account-details" size={24} color="#5E72EB" />
                                </View>
                                <Text style={{ fontSize: 11, color: '#64748B' }}>Aadhar</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={{ alignItems: 'center', opacity: 0.5 }}>
                                <View style={{ width: 50, height: 50, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                                    <MaterialCommunityIcons name="card-remove" size={24} color="#94A3B8" />
                                </View>
                                <Text style={{ fontSize: 11, color: '#94A3B8' }}>No Aadhar</Text>
                            </View>
                        )}

                        {teacher.qualification_certificate ? (
                            <TouchableOpacity onPress={() => Linking.openURL(userImageBaseUrl + teacher.qualification_certificate)} style={{ alignItems: 'center' }}>
                                <View style={{ width: 50, height: 50, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                                    <MaterialCommunityIcons name="certificate" size={24} color="#5E72EB" />
                                </View>
                                <Text style={{ fontSize: 11, color: '#64748B' }}>Certificate</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={{ alignItems: 'center', opacity: 0.5 }}>
                                <View style={{ width: 50, height: 50, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                                    <MaterialCommunityIcons name="file-hidden" size={24} color="#94A3B8" />
                                </View>
                                <Text style={{ fontSize: 11, color: '#94A3B8' }}>No Cert.</Text>
                            </View>
                        )}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#F5F7FA",
    },
    loadingText: {
        marginTop: 12,
        color: '#64748B',
        fontSize: 14
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        marginBottom: 20
    },
    header: {
        paddingTop: Constants.statusBarHeight + 10,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
        shadowColor: "#5E72EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 20
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center'
    },
    placeholderImage: {
        backgroundColor: '#FFFFFF',
    },
    initialsText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#5E72EB'
    },
    statusBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#5E72EB'
    },
    statusText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700'
    },
    headerInfo: {
        flex: 1,
        justifyContent: 'center'
    },
    studentNameHeader: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2
    },
    studentSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 8
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center'
    },
    classBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4
    },
    classBadgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600'
    },
    sessionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4
    },
    sessionBadgeText: {
        color: '#5E72EB',
        fontSize: 11,
        fontWeight: '700'
    },
    scrollView: {
        flex: 1,
        marginTop: -15
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
        paddingTop: 10
    },
    statsContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    statItem: {
        alignItems: 'center',
        flex: 1
    },
    statValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 4,
        marginBottom: 2
    },
    statLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '500'
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#E2E8F0'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        overflow: 'hidden'
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#FAFAFA'
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    cardIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#334155'
    },
    cardContent: {
        padding: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16
    },
    detailItem: {
        marginBottom: 8
    },
    halfWidthItem: {
        width: '45%' // approximate for 2 columns
    },
    fullWidthItem: {
        width: '100%'
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 6
    },
    detailIcon: {
        opacity: 0.7
    },
    detailLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    detailValue: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '500',
        paddingLeft: 20 // Indent slightly to align with label text not icon
    }
});

export default TeacherDetails;
