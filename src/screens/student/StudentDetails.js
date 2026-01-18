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
    Alert
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
import { Asset } from "expo-asset";

const StudentDetails = ({ route, navigation }) => {

    const { studentId } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);

    const backendUrl = Constants.expoConfig.extra.backendUrl;
    const userImageBaseUrl = Constants.expoConfig.extra.userImageBaseUrl;
    const generatePDF = async () => {
        if (!student) return;

        setIsPrinting(true);
        try {
            const studentPhoto = student.photo ? `${userImageBaseUrl}${student.photo}` : "https://via.placeholder.com/150";

            // Load local asset and convert to base64
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
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            font-size: 12px; 
            line-height: 1.6; 
            color: #1e293b; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .wrapper { 
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px; 
            max-width: 850px; 
            margin: 0 auto; 
            position: relative;
            overflow: hidden;
        }
        
        .wrapper::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
        }
        
        /* Header Styles */
        .header { 
            width: 100%; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
            display: table; 
            border-bottom: 2px solid #e2e8f0;
        }
        
        .logo-cell { 
            display: table-cell; 
            vertical-align: middle; 
            width: 100px; 
            text-align: left; 
        }
        
        .logo-img { 
            width: 90px; 
            height: 90px; 
            object-fit: contain;
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
            border-radius: 12px;
        }
        
        .header-content { 
            display: table-cell; 
            vertical-align: middle; 
            text-align: center; 
            padding-left: 20px;
        }
        
        .school-name { 
            font-size: 28px; 
            font-weight: 700; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0; 
            text-transform: uppercase; 
            letter-spacing: 1px;
        }
        
        .school-address { 
            font-size: 11px; 
            color: #64748b; 
            margin-top: 8px; 
            line-height: 1.6;
        }
        
        /* Form Title */
        .form-title-box { 
            text-align: center; 
            margin-bottom: 35px; 
        }
        
        .form-title { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff; 
            font-size: 15px; 
            font-weight: 600; 
            text-transform: uppercase; 
            padding: 10px 32px; 
            border-radius: 25px; 
            letter-spacing: 1.5px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        /* Section Styles */
        .section { 
            margin-bottom: 30px; 
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #e2e8f0;
        }
        
        .section-header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff; 
            padding: 10px 16px; 
            font-size: 13px; 
            font-weight: 700; 
            text-transform: uppercase; 
            border-radius: 8px;
            margin-bottom: 15px; 
            letter-spacing: 0.8px;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }
        
        /* Top Section: Photo + Basic Info */
        .top-layout { 
            display: table; 
            width: 100%; 
            margin-bottom: 0;
        }
        
        .basic-info { 
            display: table-cell; 
            vertical-align: top; 
            padding-right: 20px; 
        }
        
        .photo-container { 
            display: table-cell; 
            vertical-align: top; 
            width: 140px; 
            text-align: right; 
        }
        
        .photo-box { 
            width: 140px; 
            height: 160px; 
            border: 3px solid #667eea;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            object-fit: cover;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        /* Field Tables */
        .info-table { 
            width: 100%; 
            border-collapse: collapse; 
        }
        
        .info-table td { 
            padding: 8px 0; 
            vertical-align: top; 
        }
        
        .label-cell { 
            width: 38%; 
            color: #64748b; 
            font-size: 11px; 
            font-weight: 600; 
            text-transform: uppercase; 
            letter-spacing: 0.3px;
        }
        
        .value-cell { 
            width: 62%; 
            font-weight: 500; 
            font-size: 13px; 
            color: #1e293b;
            border-bottom: 2px dotted #cbd5e1; 
            padding-bottom: 4px;
        }
        
        /* 2-Column Grid for details */
        .col-2-grid { 
            display: table; 
            width: 100%; 
            table-layout: fixed; 
        }
        
        .grid-col { 
            display: table-cell; 
            width: 48%; 
            vertical-align: top; 
        }
        
        .grid-gap { 
            display: table-cell; 
            width: 4%; 
        }
        
        /* Kit Items */
        .kit-grid { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 10px; 
            margin-top: 10px; 
        }
        
        .kit-item { 
            border: 2px solid #86efac;
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            color: #166534; 
            padding: 8px 16px; 
            font-size: 12px; 
            border-radius: 20px; 
            font-weight: 600; 
            display: inline-flex; 
            align-items: center;
            box-shadow: 0 2px 6px rgba(34, 197, 94, 0.15);
            transition: all 0.2s ease;
        }
        
        .kit-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
        }
        
        .check-mark { 
            margin-right: 6px; 
            font-weight: bold; 
            color: #16a34a;
            font-size: 14px;
        }
        
        .no-kit { 
            font-style: italic; 
            color: #94a3b8; 
            font-size: 12px; 
            padding: 10px; 
            text-align: center;
            width: 100%;
        }
        
        /* Footer */
        .footer { 
            margin-top: 60px; 
            padding-top: 30px; 
            display: table; 
            width: 100%;
            border-top: 2px solid #e2e8f0;
        }
        
        .sig-block { 
            display: table-cell; 
            width: 40%; 
            vertical-align: bottom; 
            text-align: center; 
        }
        
        .sig-line { 
            border-top: 2px solid #334155; 
            width: 85%; 
            margin: 0 auto 8px auto; 
        }
        
        .sig-label { 
            font-size: 11px; 
            color: #64748b; 
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .footer-gap { 
            display: table-cell; 
            width: 20%; 
        }
        
        /* Print Styles */
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .wrapper {
                box-shadow: none;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <div class="logo-cell">
                <img src="${schoolLogo}" class="logo-img" alt="Logo" />
            </div>
            <div class="header-content">
                <h1 class="school-name">PADMAVATI SEMI-ENGLISH SCHOOL</h1>
                <p class="school-address">Baliraja Market Main Road, Loha, Maharashtra 431708, India<br>Phone: 7721879878</p>
            </div>
        </div>

        <div class="form-title-box">
            <span class="form-title">Student Admission Form</span>
        </div>

        <!-- Academic Details & Photo -->
        <div class="section">
            <div class="top-layout">
                <div class="basic-info">
                    <div class="section-header">📚 Academic Information</div>
                    <table class="info-table">
                        <tr>
                            <td class="label-cell">Student Name</td>
                            <td class="value-cell" style="font-weight: 700; color: #667eea;">${student.student_name || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label-cell">Student ID</td>
                            <td class="value-cell">${student.id || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label-cell">Class / Grade</td>
                            <td class="value-cell">${student.className || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label-cell">Academic Session</td>
                            <td class="value-cell">${student.academicSession || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label-cell">Admission Date</td>
                            <td class="value-cell">${student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '-'}</td>
                        </tr>
                    </table>
                </div>
                <div class="photo-container">
                    <img src="${studentPhoto}" class="photo-box" alt="Student Photo" />
                </div>
            </div>
        </div>

        <!-- Personal Information -->
        <div class="section">
            <div class="section-header">👤 Personal Details</div>
            <div class="col-2-grid">
                <div class="grid-col">
                    <table class="info-table">
                        <tr>
                            <td class="label-cell">Gender</td>
                            <td class="value-cell">${student.gender || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label-cell">Date of Birth</td>
                            <td class="value-cell">${student.dob ? new Date(student.dob).toLocaleDateString() : '-'}</td>
                        </tr>
                        <tr>
                            <td class="label-cell">Nationality</td>
                            <td class="value-cell">${student.nationalityName || '-'}</td>
                        </tr>
                    </table>
                </div>
                <div class="grid-gap"></div>
                <div class="grid-col">
                    <table class="info-table">
                        <tr>
                            <td class="label-cell">Religion</td>
                            <td class="value-cell">${student.religionName || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label-cell">Caste Category</td>
                            <td class="value-cell">${student.casteCategory || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label-cell">Mother Tongue</td>
                            <td class="value-cell">${student.motherTongue || '-'}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        <!-- Family Details -->
        <div class="section">
            <div class="section-header">👨‍👩‍👧 Family Information</div>
            <div class="col-2-grid">
                <div class="grid-col">
                    <table class="info-table">
                        <tr>
                            <td class="label-cell">Father's Name</td>
                            <td class="value-cell">${student.father_name || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label-cell">Occupation</td>
                            <td class="value-cell">${student.fatherOccupation || '-'}</td>
                        </tr>
                    </table>
                </div>
                <div class="grid-gap"></div>
                <div class="grid-col">
                    <table class="info-table">
                        <tr>
                            <td class="label-cell">Mother's Name</td>
                            <td class="value-cell">${student.mother_name || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label-cell">Occupation</td>
                            <td class="value-cell">${student.motherOccupation || '-'}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        <!-- Contact Details -->
        <div class="section">
            <div class="section-header">📞 Contact Information</div>
            <table class="info-table">
                <tr>
                    <td class="label-cell" style="width: 15%;">Mobile No.</td>
                    <td class="value-cell" style="width: 35%;">${student.mobile1 || '-'} ${student.mobile2 ? ' / ' + student.mobile2 : ''}</td>
                    <td class="label-cell" style="width: 15%; padding-left: 20px;">State</td>
                    <td class="value-cell" style="width: 35%;">${student.stateName || '-'}</td>
                </tr>
                <tr>
                    <td class="label-cell">Address</td>
                    <td class="value-cell" colspan="3">${student.address || '-'}</td>
                </tr>
            </table>
        </div>

        <!-- School Kit -->
        <div class="section">
            <div class="section-header">🎒 School Kit Provided</div>
            <div class="kit-grid">
                ${student.kitItems && student.kitItems.length > 0 ? student.kitItems.map(item => `
                    <div class="kit-item">
                        <span class="check-mark">✓</span> ${typeof item === 'string' ? item : (item.name || item.item_name || "Kit Item")}
                    </div>
                `).join('') : '<div class="no-kit">No kit items recorded for this student.</div>'}
            </div>
        </div>

        <!-- Footer / Signatures -->
        <div class="footer">
            <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-label">Parent / Guardian Signature</div>
            </div>
            <div class="footer-gap"></div>
            <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-label">Principal Signature</div>
            </div>
        </div>
    </div>
</body>
</html>
`;

            const { uri } = await Print.printToFileAsync({ html: htmlContent });

            // Rename file to Student Name
            const fileName = `${student.student_name ? student.student_name.replace(/[^a-zA-Z0-9]/g, '_') : 'Student'}_Admission_Form.pdf`;
            const newUri = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.moveAsync({
                from: uri,
                to: newUri
            });

            if (Platform.OS === "ios") {
                await Sharing.shareAsync(newUri);
            } else {
                await Sharing.shareAsync(newUri, {
                    dialogTitle: 'Share Admission Form',
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

    useLayoutEffect(() => {
        // Try setting options on the parent navigator (Stack Navigator)
        navigation.getParent()?.setOptions({
            title: "Student Details",
            headerStyle: { backgroundColor: '#5E72EB' },
            headerTintColor: '#fff',

        });

        // Also set on the current navigator just in case
        navigation.setOptions({
            title: "Student Details",
            headerStyle: { backgroundColor: '#5E72EB' },
            headerTintColor: '#fff',
            headerRight: () => (
                <TouchableOpacity onPress={generatePDF} style={{ marginRight: 15 }} disabled={isPrinting}>
                    {isPrinting ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <MaterialCommunityIcons name="printer" size={24} color="white" />
                    )}
                </TouchableOpacity>
            ),
        });
    }, [navigation, student]);

    // debuggger;

    useEffect(() => {
        if (studentId) {
            fetchStudentDetails();
        }
    }, [studentId]);

    const fetchStudentDetails = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}student/${studentId}`
            );

            // Prefer data.data when available, else fallback
            const studentData = data?.data ?? data;
            // debugger;
            setStudent(studentData);
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
                            <TouchableOpacity
                                onPress={generatePDF}
                                disabled={isPrinting}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: '#FF9F1C',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 20,
                                    elevation: 3,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.22,
                                    shadowRadius: 2.22,
                                    opacity: isPrinting ? 0.7 : 1,
                                }}
                            >
                                {isPrinting ? (
                                    <ActivityIndicator size="small" color="white" style={{ marginRight: 6 }} />
                                ) : (
                                    <MaterialCommunityIcons name="printer-outline" size={16} color="white" />
                                )}
                                <Text style={{ color: 'white', marginLeft: isPrinting ? 0 : 6, fontWeight: '700', fontSize: 12 }}>
                                    {isPrinting ? 'Printing...' : 'Print PDF'}
                                </Text>
                            </TouchableOpacity>


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

                {/* Documents */}
                {(student.aadhar_copy || student.birth_certificate) && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderLeft}>
                                <View style={styles.cardIconContainer}>
                                    <MaterialCommunityIcons name="file-document-outline" size={16} color="#5E72EB" />
                                </View>
                                <Text style={styles.cardTitle}>Documents</Text>
                            </View>
                        </View>
                        <View style={styles.cardContent}>
                            {student.aadhar_copy && (
                                <TouchableOpacity
                                    style={styles.documentButton}
                                    onPress={() => Linking.openURL(`${userImageBaseUrl}${student.aadhar_copy}`)}
                                >
                                    <MaterialCommunityIcons name="card-account-details-outline" size={24} color="#E11D48" />
                                    <Text style={styles.documentText}>Aadhar Copy</Text>
                                    <MaterialCommunityIcons name="download" size={20} color="#64748B" />
                                </TouchableOpacity>
                            )}
                            {student.birth_certificate && (
                                <TouchableOpacity
                                    style={styles.documentButton}
                                    onPress={() => Linking.openURL(`${userImageBaseUrl}${student.birth_certificate}`)}
                                >
                                    <MaterialCommunityIcons name="certificate-outline" size={24} color="#059669" />
                                    <Text style={styles.documentText}>Birth Certificate</Text>
                                    <MaterialCommunityIcons name="download" size={20} color="#64748B" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

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
    documentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginTop: 8,
        width: '100%',
    },
    documentText: {
        flex: 1,
        fontSize: 14,
        color: '#334155',
        fontWeight: '500',
        marginLeft: 12,
    },
});

export default StudentDetails;