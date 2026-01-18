import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Platform,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  Divider,
  Checkbox,
  Menu,
  Chip,
  Surface,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";

const SectionHeader = ({ title, icon }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIconBox}>
      <MaterialCommunityIcons name={icon} size={20} color="#5E72EB" />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const TeacherAdmission = ({ navigation, route }) => {
  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      title: "Teacher Registration",
    });
  }, [navigation]);

  // Dropdown States
  const [academicSessionMenuVisible, setAcademicSessionMenuVisible] = useState(false);
  const [genderMenuVisible, setGenderMenuVisible] = useState(false);

  // Date Picker States
  const [showJoiningDatePicker, setShowJoiningDatePicker] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);

  // Data States
  const [academicSessions, setAcademicSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;

  const backendUrl = Constants.expoConfig.extra.backendUrl;
  const userImageBaseUrl = Constants.expoConfig.extra.userImageBaseUrl;

  const [isEditMode, setIsEditMode] = useState(false);
  const [teacherId, setTeacherId] = useState(null);

  const stepTitles = [
    "Teacher Profile",
    "Documents",
    "Class Assignment",
    "Login Details"
  ];

  const [formData, setFormData] = useState({
    // Section 1: Login Details
    fullName: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",

    // Section 2: Teacher Profile
    qualification: "",
    joiningDate: new Date(),
    experience: "",
    gender: "",
    dob: new Date(),
    address: "",

    // Section 3: Documents
    photoUri: null,
    aadharNo: "",
    aadharCardCopyUri: null,
    qualificationCertificateUri: null,

    // Section 4: Class Assignment
    academicSessionId: "",
    assignedClasses: [], // Array of class IDs
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Reusing getStudentFromCreatingData for classes and sessions as they are likely shared
        const response = await axios.get(`${backendUrl}getStudentFromCreatingData`);
        if (response.data.status) {
          const { classes, academic_session } = response.data.data;

          setClasses(classes.map(c => ({ label: c.class_name, value: c.id })) || []);
          setAcademicSessions(academic_session || []);

          // Set default active session
          const activeSession = academic_session.find(s => s.is_active === '1') || academic_session[0];
          if (activeSession && !route.params?.teacherId) {
            setFormData(prev => ({ ...prev, academicSessionId: activeSession.id }));
          }

        } else {
          // Fallback or error handling
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        Toast.show({ type: "error", text1: "Failed to load form data" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [backendUrl]);

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      const { teacherId } = route.params || {};
      if (teacherId) {
        setTeacherId(teacherId);
        setIsEditMode(true);
        try {
          setIsLoading(true);
          const response = await axios.get(`${backendUrl}teacher/${teacherId}`);

          if (response.data.status) {
            // Note: API returns 'teacher' key, or sometimes 'data' depending on endpoint.
            // Based on checking TeacherDetails, it seems to be 'teacher'.
            // Fallback to data.data if teacher is missing just in case.
            const data = response.data.teacher || response.data.data;

            // Map Assigned Classes
            // The log shows classes is an array of objects: { class_id: 1, academic_session_id: 1, ... }
            let mappedClasses = [];
            let sessionId = "";

            if (data.classes && Array.isArray(data.classes)) {
              mappedClasses = data.classes.map(c => (typeof c === 'object' ? (c.class_id || c.id) : c));
              // Extract session id from first class entry if available
              if (data.classes.length > 0 && data.classes[0].academic_session_id) {
                sessionId = data.classes[0].academic_session_id;
              }
            }

            // If session ID not found in classes, try root (though log didn't show it)
            if (!sessionId && data.academic_session_id) sessionId = data.academic_session_id;


            setFormData(prev => ({
              ...prev,
              fullName: data.user?.name || data.full_name || "",
              mobileNumber: data.user?.mobile || data.mobile_no || "",
              email: data.user?.email || data.email || "",
              // Password fields left blank
              password: "",
              confirmPassword: "",

              qualification: data.qualification || "",
              joiningDate: data.joining_date ? new Date(data.joining_date) : new Date(),
              experience: (data.experience_years || data.experience) ? String(data.experience_years || data.experience) : "",
              gender: data.gender || "",
              dob: data.dob ? new Date(data.dob) : new Date(),
              address: data.address || "",

              photoUri: (data.profile_photo || data.photo) ? `${userImageBaseUrl}${data.profile_photo || data.photo}` : null,
              aadharNo: data.aadhar_number || data.aadhar_no || "",
              aadharCardCopyUri: data.aadhar_copy ? `${userImageBaseUrl}${data.aadhar_copy}` : null,
              qualificationCertificateUri: data.qualification_certificate ? `${userImageBaseUrl}${data.qualification_certificate}` : null,

              academicSessionId: sessionId,
              assignedClasses: mappedClasses
            }));

            navigation.getParent()?.setOptions({
              title: "Edit Teacher Details",
            });
          }
        } catch (error) {
          console.error("Error fetching teacher details:", error);
          Toast.show({ type: "error", text1: "Failed to load teacher data" });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTeacherDetails();
  }, [route.params?.teacherId, backendUrl, userImageBaseUrl]);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleCheckboxChange = (classId) => {
    const { assignedClasses } = formData;
    const newAssignedClasses = assignedClasses.includes(classId)
      ? assignedClasses.filter((id) => id !== classId)
      : [...assignedClasses, classId];
    setFormData({ ...formData, assignedClasses: newAssignedClasses });
    if (errors.assignedClasses) setErrors({ ...errors, assignedClasses: null });
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 3) { // Login Details
      if (!formData.fullName) newErrors.fullName = "Full Name is required.";
      if (!formData.mobileNumber) newErrors.mobileNumber = "Mobile Number is required.";
      else if (!/^\d{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = "Invalid Mobile Number (10 digits).";

      // Email is optional (User Req: Required ❌)

      if (!isEditMode && !formData.password) newErrors.password = "Password is required.";
      if (!isEditMode && !formData.confirmPassword) newErrors.confirmPassword = "Confirm Password is required.";
      if (formData.password && formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    }

    if (step === 0) { // Teacher Profile
      if (!formData.qualification) newErrors.qualification = "Qualification is required.";
      if (!formData.joiningDate) newErrors.joiningDate = "Joining Date is required.";
      // Experience, Gender, DOB, Address are Optional (User Req: ❌)
    }

    if (step === 1) { // Documents
      // All Optional (User Req: No required check)
    }

    if (step === 2) { // Class Assignment
      if (!formData.academicSessionId) newErrors.academicSessionId = "Academic Session is required.";
      if (formData.assignedClasses.length === 0) newErrors.assignedClasses = "At least one class must be assigned.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async (field) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Need gallery permissions!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: field === 'photoUri', // only profile photo editable
      aspect: [3, 4],
      quality: 0.7,
    });

    if (!result.canceled) {
      handleInputChange(field, result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    const formDataToSend = new FormData();

    // Section 1
    formDataToSend.append('full_name', formData.fullName);
    formDataToSend.append('mobile_no', formData.mobileNumber);
    formDataToSend.append('email', formData.email);
    if (formData.password) {
      formDataToSend.append('password', formData.password);
    }

    // Section 2
    formDataToSend.append('qualification', formData.qualification);
    formDataToSend.append('joining_date', formData.joiningDate.toISOString().split("T")[0]);
    formDataToSend.append('experience', formData.experience);
    formDataToSend.append('gender', formData.gender);
    formDataToSend.append('dob', formData.dob.toISOString().split("T")[0]);
    formDataToSend.append('address', formData.address);

    // Section 3
    formDataToSend.append('aadhar_no', formData.aadharNo);

    // Section 4
    formDataToSend.append('academic_session_id', formData.academicSessionId);
    formDataToSend.append('class_ids', JSON.stringify(formData.assignedClasses));

    // Files
    const appendFile = (uri, name) => {
      if (uri && !uri.startsWith("http")) {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formDataToSend.append(name, { uri, name: filename, type });
      }
    };

    appendFile(formData.photoUri, 'photo');
    appendFile(formData.aadharCardCopyUri, 'aadhar_copy');
    appendFile(formData.qualificationCertificateUri, 'qualification_certificate');

    try {
      // console.log(formDataToSend);
      const url = isEditMode && teacherId
        ? `${backendUrl}teachers/update/${teacherId}`
        : `${backendUrl}teachers/register`;

      const response = await axios.post(url, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status) {
        Toast.show({ type: "success", text1: response.data.message || (isEditMode ? "Updated Successfully!" : "Teacher Registered Successfully!") });
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        Toast.show({ type: "error", text1: response.data.message || "Operation Failed" });
      }

    } catch (error) {
      console.error(error);
      Toast.show({ type: "error", text1: "Network Error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
      else handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>

      {/* Stepper Header */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${((currentStep + 1) / totalSteps) * 100}%` }]} />
        </View>
        <Text style={styles.stepTitle}>{stepTitles[currentStep]} ({currentStep + 1}/{totalSteps})</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>

            {/* SECTION 1: Login Details (MOVED TO STEP 3) */}
            {currentStep === 3 && (
              <>
                <SectionHeader title="Login Details" icon="login" />

                <TextInput
                  label="Full Name *"
                  value={formData.fullName}
                  onChangeText={(t) => handleInputChange("fullName", t)}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#CBD5E1"
                  activeOutlineColor="#5E72EB"
                  textColor="#1E293B"
                  dense
                  error={errors.fullName}
                />
                {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

                <TextInput
                  label="Mobile Number *"
                  value={formData.mobileNumber}
                  onChangeText={(t) => handleInputChange("mobileNumber", t)}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#CBD5E1"
                  activeOutlineColor="#5E72EB"
                  textColor="#1E293B"
                  dense
                  error={errors.mobileNumber}
                />
                {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}

                <TextInput
                  label="Email Address"
                  value={formData.email}
                  onChangeText={(t) => handleInputChange("email", t)}
                  keyboardType="email-address"
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#CBD5E1"
                  activeOutlineColor="#5E72EB"
                  textColor="#1E293B"
                  dense
                />

                <TextInput
                  label="Password *"
                  value={formData.password}
                  onChangeText={(t) => handleInputChange("password", t)}
                  secureTextEntry
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#CBD5E1"
                  activeOutlineColor="#5E72EB"
                  textColor="#1E293B"
                  dense
                  error={errors.password}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                <TextInput
                  label="Confirm Password *"
                  value={formData.confirmPassword}
                  onChangeText={(t) => handleInputChange("confirmPassword", t)}
                  secureTextEntry
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#CBD5E1"
                  activeOutlineColor="#5E72EB"
                  textColor="#1E293B"
                  dense
                  error={errors.confirmPassword}
                />
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </>
            )}

            {/* SECTION 2: Teacher Profile (MOVED TO STEP 0) */}
            {currentStep === 0 && (
              <>
                <SectionHeader title="Teacher Profile" icon="account-tie" />

                <TextInput
                  label="Qualification *"
                  value={formData.qualification}
                  onChangeText={(t) => handleInputChange("qualification", t)}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#CBD5E1"
                  activeOutlineColor="#5E72EB"
                  textColor="#1E293B"
                  dense
                  error={errors.qualification}
                />
                {errors.qualification && <Text style={styles.errorText}>{errors.qualification}</Text>}

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Joining Date *</Text>
                    <TouchableOpacity onPress={() => setShowJoiningDatePicker(true)} style={styles.selectBox}>
                      <Text style={styles.selectText}>{formData.joiningDate.toLocaleDateString()}</Text>
                      <MaterialCommunityIcons name="calendar-month" size={20} color="#5E72EB" />
                    </TouchableOpacity>
                    {showJoiningDatePicker && (
                      <DateTimePicker
                        value={formData.joiningDate}
                        mode="date"
                        display="default"
                        onChange={(e, d) => {
                          setShowJoiningDatePicker(Platform.OS === 'ios');
                          if (d) handleInputChange("joiningDate", d);
                        }}
                      />
                    )}
                    {errors.joiningDate && <Text style={styles.errorText}>{errors.joiningDate}</Text>}
                  </View>

                  <View style={styles.inputGap} />

                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Experience (Years)</Text>
                    <TextInput
                      value={formData.experience}
                      onChangeText={(t) => handleInputChange("experience", t)}
                      keyboardType="numeric"
                      style={[styles.input, { marginBottom: 0, height: 50 }]}
                      mode="outlined"
                      outlineColor="#CBD5E1"
                      activeOutlineColor="#5E72EB"
                      textColor="#1E293B"
                      dense
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Gender</Text>
                    <Menu
                      visible={genderMenuVisible}
                      onDismiss={() => setGenderMenuVisible(false)}
                      anchor={
                        <TouchableOpacity onPress={() => setGenderMenuVisible(true)} style={styles.selectBox}>
                          <Text style={styles.selectText}>{formData.gender || "Select"}</Text>
                          <MaterialCommunityIcons name="chevron-down" size={24} color="#64748B" />
                        </TouchableOpacity>
                      }
                    >
                      {["Male", "Female", "Other"].map(g => (
                        <Menu.Item key={g} onPress={() => { handleInputChange("gender", g); setGenderMenuVisible(false); }} title={g} />
                      ))}
                    </Menu>
                  </View>

                  <View style={styles.inputGap} />

                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Date of Birth</Text>
                    <TouchableOpacity onPress={() => setShowDobPicker(true)} style={styles.selectBox}>
                      <Text style={styles.selectText}>{formData.dob.toLocaleDateString()}</Text>
                      <MaterialCommunityIcons name="calendar-month" size={20} color="#5E72EB" />
                    </TouchableOpacity>
                    {showDobPicker && (
                      <DateTimePicker
                        value={formData.dob}
                        mode="date"
                        display="default"
                        onChange={(e, d) => {
                          setShowDobPicker(Platform.OS === 'ios');
                          if (d) handleInputChange("dob", d);
                        }}
                      />
                    )}
                  </View>
                </View>

                <TextInput
                  label="Address"
                  value={formData.address}
                  onChangeText={(t) => handleInputChange("address", t)}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, { height: 'auto', minHeight: 80 }]}
                  mode="outlined"
                  outlineColor="#CBD5E1"
                  activeOutlineColor="#5E72EB"
                  textColor="#1E293B"
                  dense
                />
              </>
            )}

            {/* SECTION 3: Documents (MOVED TO STEP 1) */}
            {currentStep === 1 && (
              <>
                <SectionHeader title="Documents" icon="file-document-multiple" />

                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <TouchableOpacity onPress={() => pickImage("photoUri")} style={styles.photoBox}>
                    {formData.photoUri ? (
                      <Image source={{ uri: formData.photoUri }} style={styles.photoImage} />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <MaterialCommunityIcons name="camera" size={26} color="#999" />
                        <Text style={styles.photoText}>Profile Photo</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                <TextInput
                  label="Aadhaar Number"
                  value={formData.aadharNo}
                  onChangeText={(t) => handleInputChange("aadharNo", t)}
                  maxLength={12}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#CBD5E1"
                  activeOutlineColor="#5E72EB"
                  textColor="#1E293B"
                  dense
                />

                {/* Aadhaar Copy Upload */}
                <TouchableOpacity
                  style={[styles.uploadCard, formData.aadharCardCopyUri && styles.uploadCardSuccess]}
                  onPress={() => pickImage("aadharCardCopyUri")}
                >
                  <MaterialCommunityIcons name={formData.aadharCardCopyUri ? "check-circle" : "card-account-details-outline"} size={28} color={formData.aadharCardCopyUri ? "#2DD4BF" : "#5E72EB"} />
                  <Text style={[styles.uploadCardText, formData.aadharCardCopyUri && { color: "#0F766E" }]}>{formData.aadharCardCopyUri ? "Aadhaar Copy Uploaded" : "Upload Aadhaar Copy"}</Text>
                </TouchableOpacity>

                {/* Qualification Certificate Upload */}
                <TouchableOpacity
                  style={[styles.uploadCard, formData.qualificationCertificateUri && styles.uploadCardSuccess, { marginTop: 10 }]}
                  onPress={() => pickImage("qualificationCertificateUri")}
                >
                  <MaterialCommunityIcons name={formData.qualificationCertificateUri ? "check-circle" : "certificate-outline"} size={28} color={formData.qualificationCertificateUri ? "#2DD4BF" : "#5E72EB"} />
                  <Text style={[styles.uploadCardText, formData.qualificationCertificateUri && { color: "#0F766E" }]}>{formData.qualificationCertificateUri ? "Certificate Uploaded" : "Upload Qualification Certificate"}</Text>
                </TouchableOpacity>

              </>
            )}

            {/* SECTION 4: Class Assignment (MOVED TO STEP 2) */}
            {currentStep === 2 && (
              <>
                <SectionHeader title="Class Assignment" icon="book-education" />

                <Text style={styles.label}>Academic Session *</Text>
                <Menu
                  visible={academicSessionMenuVisible}
                  onDismiss={() => setAcademicSessionMenuVisible(false)}
                  anchor={
                    <TouchableOpacity onPress={() => setAcademicSessionMenuVisible(true)} style={styles.selectBox}>
                      <Text style={styles.selectText}>
                        {academicSessions.find(s => s.id === formData.academicSessionId)?.session_name || "Select Session"}
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={24} color="#64748B" />
                    </TouchableOpacity>
                  }
                >
                  {academicSessions.map(s => (
                    <Menu.Item
                      key={s.id}
                      onPress={() => { handleInputChange("academicSessionId", s.id); setAcademicSessionMenuVisible(false); }}
                      title={s.session_name + (s.is_active === '1' ? " (Active)" : "")}
                    />
                  ))}
                </Menu>
                {errors.academicSessionId && <Text style={styles.errorText}>{errors.academicSessionId}</Text>}

                <Text style={[styles.label, { marginTop: 10 }]}>Assigned Class(es) *</Text>
                <View style={styles.kitGrid}>
                  {classes.map((cls) => (
                    <TouchableOpacity
                      key={cls.value}
                      style={[styles.kitItem, formData.assignedClasses.includes(cls.value) && styles.kitItemSelected]}
                      onPress={() => handleCheckboxChange(cls.value)}
                    >
                      <Checkbox
                        status={formData.assignedClasses.includes(cls.value) ? "checked" : "unchecked"}
                        color="#5E72EB"
                      />
                      <Text style={styles.kitItemText}>{cls.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.assignedClasses && <Text style={styles.errorText}>{errors.assignedClasses}</Text>}

              </>
            )}

          </Card.Content>
        </Card>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {currentStep > 0 && (
          <Button mode="outlined" onPress={handleBack} style={styles.navButton} textColor="#64748B" contentStyle={{ height: 48 }}>
            Back
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleNext}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={[styles.navButton, { flex: 1, marginLeft: currentStep > 0 ? 12 : 0 }]}
          buttonColor="#5E72EB"
          contentStyle={{ height: 48 }}
          labelStyle={{ fontSize: 16, fontWeight: "bold" }}
        >
          {currentStep === totalSteps - 1 ? "Complete Registration" : "Next Step"}
        </Button>
      </View>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  progressContainer: { paddingHorizontal: 20, marginVertical: 10 },
  progressBarBackground: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#5E72EB', borderRadius: 3 },
  stepTitle: { marginTop: 6, fontSize: 12, color: '#5E72EB', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
  scrollContent: { paddingBottom: 100, paddingHorizontal: 16 },
  card: { borderRadius: 16, backgroundColor: '#fff', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, paddingVertical: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15, marginTop: 4 },
  sectionIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#EEF2FF", justifyContent: "center", alignItems: "center", marginRight: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  input: { marginBottom: 12, backgroundColor: "#fff", fontSize: 13 },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: -8, marginBottom: 8, marginLeft: 4 },
  row: { flexDirection: "row", gap: 10, marginBottom: 4 },
  halfWidth: { flex: 1 },
  label: { fontSize: 12, color: "#475569", marginBottom: 4, fontWeight: "600", marginLeft: 2 },
  selectBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: "#fff", marginBottom: 12 },
  selectText: { fontSize: 13, color: "#334155" },
  inputGap: { width: 8 },

  // Photo
  photoBox: { width: 100, height: 120, borderRadius: 16, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#E2E8F0", borderStyle: "dashed", overflow: 'hidden', alignSelf: 'center' },
  photoImage: { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center' },
  photoText: { fontSize: 11, color: '#64748B', marginTop: 8, fontWeight: "500" },

  // Uploads
  uploadCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, borderStyle: 'dashed', gap: 10, backgroundColor: '#FAFAFA' },
  uploadCardSuccess: { backgroundColor: '#F0FDFA', borderColor: '#2DD4BF', borderStyle: 'solid' },
  uploadCardText: { fontSize: 13, color: '#475569', fontWeight: '600', flex: 1 },

  // Grid
  kitGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  kitItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 8, paddingRight: 8, width: "48%", borderWidth: 1, borderColor: "#E2E8F0", paddingVertical: 4 },
  kitItemSelected: { backgroundColor: "#EEF2FF", borderColor: "#5E72EB" },
  kitItemText: { fontSize: 12, color: "#334155", flex: 1, fontWeight: "500" },

  // Footer
  footer: { position: 'absolute', bottom: 10, left: 15, right: 15, flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderRadius: 16, elevation: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  navButton: { borderRadius: 10 },
});

export default TeacherAdmission;
