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

const StudentAdmissionForm = ({ navigation, route }) => {
  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      title: "Student Admission",
    });
  }, [navigation]);

  const [classMenuVisible, setClassMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [casteMenuVisible, setCasteMenuVisible] = useState(false);
  const [religionMenuVisible, setReligionMenuVisible] = useState(false);
  const [nationalityMenuVisible, setNationalityMenuVisible] = useState(false);
  const [motherTongueMenuVisible, setMotherTongueMenuVisible] = useState(false);
  const [stateMenuVisible, setStateMenuVisible] = useState(false);

  const [errors, setErrors] = useState({});
  const [classes, setClasses] = useState([]);
  const [religions, setReligions] = useState([]);
  const [casteCategories, setCasteCategories] = useState([]);
  const [kitAccessories, setKitAccessories] = useState([]);
  const [states, setStates] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [motherTongues, setMotherTongues] = useState([]);
  const [classFees, setClassFees] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;

  const stepTitles = [
    "Admission & Basic Info",
    "Personal Details",
    "Family & Contact",
    "Documents & Fees"
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const backendUrl = Constants.expoConfig.extra.backendUrl;
  const userImageBaseUrl = Constants.expoConfig.extra.userImageBaseUrl;
  // const userImageBaseUrl = backendUrl;

  const [formData, setFormData] = useState({
    classId: "",
    academicYearFrom: new Date().getFullYear().toString(),
    academicYearTo: (new Date().getFullYear() + 1).toString(),
    admissionDate: new Date(),
    firstName: "",
    middleName: "",
    lastName: "",
    photoUri: null,
    fatherName: "",
    motherName: "",
    residentialAddress: "",
    parentMobile1: "",
    parentMobile2: "",
    dob: new Date(),
    gender: "",
    religion: "",
    birthPlace: "",
    nationality: "Indian",
    motherTongue: "Marathi",
    state: "Maharashtra",
    caste: "",
    fatherOccupation: "farmer",
    motherOccupation: "Housewife",
    aadharNo: "",
    birthCertificateUri: null,
    aadharCardCopyUri: null,
    kitItems: [],
    totalFees: "",
    discount: "",
  });

  useEffect(() => {
    const fetchAdmissionData = async () => {
      try {
        // console.log(`${backendUrl}/getStudentFromCreatingData`);

        const response = await axios.get(`${backendUrl}getStudentFromCreatingData`);
        // console.log(response.data.data);
        // debugger;
        if (response.data.status) {
          const {
            classes,
            academic_session,
            kit_items,
            religions,
            caste_categories,
            states,
            nationalities,
            mother_tongues,
            class_fees,
          } = response.data.data;

          setClasses(classes.map(c => ({ label: c.class_name, value: c.id })) || []);
          setReligions(religions.map(r => r.religion_name) || []);
          setCasteCategories(caste_categories.map(c => c.caste_name) || []);
          setStates(states.map(s => s.state_name) || []);
          setNationalities(nationalities.map(n => n.nationality_name) || []);
          setMotherTongues(mother_tongues.map(m => m.tongue_name) || []);
          setClassFees(class_fees || []);

          const allKitItems = kit_items.map(k => k.item_name) || [];
          setKitAccessories(allKitItems);

          if (academic_session && academic_session.length > 0) {
            const activeSession = academic_session.find(s => s.is_active === '1') || academic_session[0];
            setFormData((prev) => ({
              ...prev,
              kitItems: allKitItems,
              academicYearFrom: activeSession.start_date ? activeSession.start_date.substring(0, 4) : new Date().getFullYear().toString(),
              academicYearTo: activeSession.end_date ? activeSession.end_date.substring(0, 4) : (new Date().getFullYear() + 1).toString(),
            }));
          }
        } else {
          Alert.alert(
            "Error",
            response.data.message || "Failed to load initial admission data."
          );
        }
      } catch (error) {
        console.error("Error fetching admission data:", error);
        if (error.response) {
          Alert.alert("Server Error", "Could not load data from the server.");
        } else if (error.request) {
          Alert.alert("Network Error", "Unable to connect to the server.");
        } else {
          Alert.alert("Error", "An unexpected error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmissionData();
  }, [backendUrl]);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      const { studentId } = route.params || {};
      if (studentId) {
        setStudentId(studentId);
        setIsEditMode(true);
        try {
          setIsLoading(true);
          const response = await axios.get(`${backendUrl}student/${studentId}`);

          if (response.data && (response.data.status === 'success' || response.data.data)) {
            const data = response.data.data || response.data;

            // Helper to parsing names if separate fields not available
            let fName = data.first_name || "";
            let mName = data.middle_name || "";
            let lName = data.last_name || "";

            if (!fName && data.student_name) {
              const parts = data.student_name.split(' ');
              if (parts.length > 0) fName = parts[0];
              if (parts.length > 2) {
                mName = parts.slice(1, -1).join(' ');
                lName = parts[parts.length - 1];
              } else if (parts.length === 2) {
                lName = parts[1];
              }
            }

            setFormData(prev => ({
              ...prev,
              classId: data.class_id,
              academicYearFrom: data.academic_year_from || prev.academicYearFrom,
              academicYearTo: data.academic_year_to || prev.academicYearTo,
              admissionDate: data.admission_date ? new Date(data.admission_date) : new Date(data.admissionDate),
              firstName: fName,
              middleName: mName,
              lastName: lName,
              photoUri: data.photo ? `${userImageBaseUrl}${data.photo}` : null,
              fatherName: data.father_name || "",
              motherName: data.mother_name || "",
              residentialAddress: data.address || data.residential_address || "",
              parentMobile1: data.mobile1 || data.parent_mobile_1 || "",
              parentMobile2: data.mobile2 || data.parent_mobile_2 || "",
              dob: data.dob ? new Date(data.dob) : new Date(),
              gender: data.gender || "",
              religion: data.religionName || data.religion || "",
              birthPlace: data.birthPlace || data.birth_place || "",
              nationality: data.nationalityName || data.nationality || "Indian",
              motherTongue: data.motherTongue || data.mother_tongue || "Marathi",
              state: data.stateName || data.state || "Maharashtra",
              caste: data.casteCategory || data.caste || "",
              fatherOccupation: data.fatherOccupation || data.father_occupation || "",
              motherOccupation: data.motherOccupation || data.mother_occupation || "",
              aadharNo: data.aadharNo || data.aadhar_no || "",
              totalFees: data.feeAmount ? data.feeAmount.toString() : "",
              discount: data.discountAmount ? data.discountAmount.toString() : "",
              birthCertificateUri: data.birth_certificate ? `${userImageBaseUrl}${data.birth_certificate}` : null,
              aadharCardCopyUri: data.aadhar_copy || data.aadhar_card ? `${userImageBaseUrl}${data.aadhar_copy || data.aadhar_card}` : null,
              kitItems: data.kitItems ? (data.kitItems) : (prev.kitItems || [])
            }));
            navigation.getParent()?.setOptions({
              title: "Edit Student",
            });
          }
        } catch (error) {
          console.error("Error fetching student details for edit:", error);
          Toast.show({
            type: "error",
            text1: "Failed to load student details",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchStudentDetails();
  }, [route.params?.studentId, backendUrl, userImageBaseUrl]);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.classId) newErrors.classId = "Class is required.";
      if (!formData.firstName) newErrors.firstName = "First name is required.";
      if (!formData.middleName) newErrors.middleName = "Middle name is required.";
      if (!formData.lastName) newErrors.lastName = "Last name is required.";
      if (!formData.photoUri) newErrors.photoUri = "Student photo is required.";
    }

    if (step === 1) {
      if (!formData.gender) newErrors.gender = "Gender is required.";
      if (!formData.religion) newErrors.religion = "Religion is required.";
      if (!formData.caste) newErrors.caste = "Caste category is required.";
      if (!formData.birthPlace) newErrors.birthPlace = "Birth place is required.";
      if (!formData.nationality) newErrors.nationality = "Nationality is required.";
      if (!formData.motherTongue) newErrors.motherTongue = "Mother tongue is required.";
      if (!formData.state) newErrors.state = "State is required.";
    }

    if (step === 2) {
      if (!formData.fatherName) newErrors.fatherName = "Father's name is required.";
      if (!formData.fatherOccupation) newErrors.fatherOccupation = "Father's occupation is required.";
      if (!formData.motherName) newErrors.motherName = "Mother's name is required.";
      if (!formData.motherOccupation) newErrors.motherOccupation = "Mother's occupation is required.";
      if (!formData.residentialAddress) newErrors.residentialAddress = "Residential address is required.";
      const mobileRegex = /^[0-9]{10}$/;
      if (!formData.parentMobile1) {
        newErrors.parentMobile1 = "Mobile number is required.";
      } else if (!mobileRegex.test(formData.parentMobile1)) {
        newErrors.parentMobile1 = "Enter a valid 10-digit mobile number.";
      }
    }

    if (step === 3) {
      if (!formData.aadharNo) newErrors.aadharNo = "Aadhar number is required.";
      if (!formData.birthCertificateUri) newErrors.birthCertificateUri = "Birth certificate is required.";
      if (!formData.aadharCardCopyUri) newErrors.aadharCardCopyUri = "Aadhar card copy is required.";
      if (!formData.totalFees) newErrors.totalFees = "Total fees is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } else {
      Alert.alert("Required Fields", "Please fill in all required fields marked with *");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateMobileNumber = (number) => {
    const mobileRegex = /^[0-9]{10}$/;
    if (!number || !mobileRegex.test(number)) {
      setErrors((prev) => ({
        ...prev,
        parentMobile1: "Enter a valid 10-digit mobile number.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, parentMobile1: null }));
    }
  };

  const handleCheckboxChange = (item) => {
    const { kitItems } = formData;
    const newKitItems = kitItems.includes(item)
      ? kitItems.filter((i) => i !== item)
      : [...kitItems, item];
    setFormData({ ...formData, kitItems: newKitItems });
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.admissionDate;
    setShowDatePicker(Platform.OS === "ios");
    handleInputChange("admissionDate", currentDate);
  };

  const pickImage = async (field) => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || mediaLibraryStatus !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera and gallery permissions to make this work!"
      );
      return;
    }

    Alert.alert("Upload Photo", "Choose an option", [
      {
        text: "Camera",
        onPress: async () => {
          let result = await ImagePicker.launchCameraAsync({
            allowsEditing: field === "photoUri",
            aspect: field === "photoUri" ? [3, 4] : undefined,
            quality: 0.7,
          });
          if (!result.canceled) {
            handleInputChange(field, result.assets[0].uri);
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: field === "photoUri",
            aspect: field === "photoUri" ? [3, 4] : undefined,
            quality: 0.7,
          });
          if (!result.canceled) {
            handleInputChange(field, result.assets[0].uri);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSubmit = async () => {

    if (!validateStep(currentStep)) {
      Alert.alert("Required Fields", "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    const formDataToSend = new FormData();

    // Append text fields
    formDataToSend.append('classId', formData.classId);
    formDataToSend.append('admissionDate', formData.admissionDate.toISOString().split("T")[0]);
    formDataToSend.append('firstName', formData.firstName);
    formDataToSend.append('middleName', formData.middleName);
    formDataToSend.append('lastName', formData.lastName);
    formDataToSend.append('fatherName', formData.fatherName);
    formDataToSend.append('motherName', formData.motherName);
    formDataToSend.append('residentialAddress', formData.residentialAddress);
    formDataToSend.append('parentMobile1', formData.parentMobile1);
    formDataToSend.append('parentMobile2', formData.parentMobile2);
    formDataToSend.append('dob', formData.dob.toISOString().split("T")[0]);
    formDataToSend.append('gender', formData.gender);
    formDataToSend.append('religion', formData.religion);
    formDataToSend.append('birthPlace', formData.birthPlace);
    formDataToSend.append('nationality', formData.nationality);
    formDataToSend.append('motherTongue', formData.motherTongue);
    formDataToSend.append('state', formData.state);
    formDataToSend.append('caste', formData.caste);
    formDataToSend.append('fatherOccupation', formData.fatherOccupation);
    formDataToSend.append('motherOccupation', formData.motherOccupation);
    formDataToSend.append('aadharNo', formData.aadharNo);
    formDataToSend.append('totalFees', formData.totalFees);
    formDataToSend.append('discount', formData.discount);
    formDataToSend.append('kitItems', JSON.stringify(formData.kitItems));

    // Add student ID if in edit mode
    if (isEditMode && studentId) {
      formDataToSend.append('studentId', studentId);
    }

    // Append image files (only send new local images)
    if (formData.photoUri && !formData.photoUri.startsWith("http")) {
      const filename = formData.photoUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formDataToSend.append('photo', {
        uri: formData.photoUri,
        name: filename,
        type: type,
      });
    }

    if (formData.birthCertificateUri && !formData.birthCertificateUri.startsWith("http")) {
      const filename = formData.birthCertificateUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formDataToSend.append('birthCertificate', {
        uri: formData.birthCertificateUri,
        name: filename,
        type: type,
      });
    }

    if (formData.aadharCardCopyUri && !formData.aadharCardCopyUri.startsWith("http")) {
      const filename = formData.aadharCardCopyUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formDataToSend.append('aadharCard', {
        uri: formData.aadharCardCopyUri,
        name: filename,
        type: type,
      });
    }

    // console.log("Form Data prepared for submission", formDataToSend);

    try {
      const url = isEditMode && studentId
        ? `${backendUrl}students/update/${studentId}`
        : `${backendUrl}students/register`;

      const response = await axios.post(url, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.status) {
        Toast.show({
          type: "success",
          text1: response.data.message,
          visibilityTime: 2000,
        });


        setTimeout(() => {
          navigation.navigate("StudentDashboard");
        }, 2000);



      } else {
        Toast.show({
          type: "error",
          text1: response.data.message || "Failed to create student.",
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      var massage = error.response.data.message || "Failed to create student due to a network error.";
      // console.error("Error creating student:", error);
      Toast.show({
        type: "error",
        text1: massage,
        visibilityTime: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={styles.header}>

      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${((currentStep + 1) / totalSteps) * 100}%` }]} />
        </View>
        <Text style={styles.stepTitle}>{stepTitles[currentStep]} ({currentStep + 1}/{totalSteps})</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>

            {/* STEP 1: Admission & Basic Info */}
            {currentStep === 0 && (
              <>
                <Surface style={styles.infoCard}>
                  <View style={styles.row}>
                    <View style={styles.halfWidth}>
                      <Text style={styles.label}>Class *</Text>
                      <Menu
                        visible={classMenuVisible}
                        onDismiss={() => setClassMenuVisible(false)}
                        anchor={
                          <TouchableOpacity
                            style={styles.selectBox}
                            onPress={() => setClassMenuVisible(true)}
                          >
                            <Text style={styles.selectText}>
                              {formData.classId
                                ? classes.find((c) => c.value === formData.classId)
                                  ?.label || "Select"
                                : isLoading
                                  ? "Loading..."
                                  : "Select"}
                            </Text>
                            <MaterialCommunityIcons
                              name="chevron-down"
                              size={20}
                              color="#666"
                            />
                          </TouchableOpacity>
                        }
                      >
                        {!isLoading &&
                          classes.map((cls, index) => (
                            <Menu.Item
                              key={`${cls.value}-${index}`}
                              onPress={() => {
                                const selectedClassId = cls.value;
                                const selectedFee = classFees.find(fee => fee.class_id === selectedClassId)?.fee_amount || "";
                                setFormData({ ...formData, classId: selectedClassId, totalFees: selectedFee.toString() });
                                if (errors.classId) setErrors({ ...errors, classId: null });
                                setClassMenuVisible(false);
                              }}
                              title={cls.label}
                            />
                          ))}
                      </Menu>
                      {errors.classId && (
                        <Text style={styles.errorText}>{errors.classId}</Text>
                      )}
                    </View>

                    <View style={styles.halfWidth}>
                      <Text style={styles.label}>Admission Date *</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <View style={styles.selectBox}>
                          <Text style={styles.selectText}>
                            {formData.admissionDate.toLocaleDateString()}
                          </Text>
                          <MaterialCommunityIcons
                            name="calendar"
                            size={18}
                            color="#5E72EB"
                          />
                        </View>
                      </TouchableOpacity>
                      {showDatePicker && (
                        <DateTimePicker
                          value={formData.admissionDate}
                          mode="date"
                          display="default"
                          onChange={onDateChange}
                        />
                      )}
                    </View>
                  </View>
                </Surface>

                <SectionHeader title="Student Basic Info" icon="account" />

                <TouchableOpacity
                  onPress={() => pickImage("photoUri")}
                  style={styles.photoBox}
                >
                  {formData.photoUri ? (
                    <Image
                      key={formData.photoUri} // Force re-render on URI change
                      source={{ uri: formData.photoUri }}
                      style={styles.photoImage}
                      onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
                    />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <MaterialCommunityIcons name="camera" size={26} color="#999" />
                      <Text style={styles.photoText}>Add Passport Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TextInput
                  label="First Name *"
                  value={formData.firstName}
                  onChangeText={(text) => handleInputChange("firstName", text)}
                  style={styles.input}
                  textColor="#1a1a1a"
                  mode="outlined"
                  dense
                />
                {errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}

                <View style={styles.row}>
                  <TextInput
                    label="Middle Name *"
                    value={formData.middleName}
                    onChangeText={(text) => handleInputChange("middleName", text)}
                    style={[styles.input, styles.flex1]}
                    textColor="#1a1a1a"
                    mode="outlined"
                    dense
                  />
                  <View style={styles.inputGap} />
                  <TextInput
                    label="Last Name *"
                    value={formData.lastName}
                    onChangeText={(text) => handleInputChange("lastName", text)}
                    style={[styles.input, styles.flex1]}
                    textColor="#1a1a1a"
                    mode="outlined"
                    dense
                  />
                </View>
                {errors.middleName && (
                  <Text style={styles.errorText}>{errors.middleName}</Text>
                )}
                {errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}
                {errors.photoUri && (
                  <Text style={styles.errorText}>{errors.photoUri}</Text>
                )}
              </>
            )}

            {/* STEP 2: Personal Details */}
            {currentStep === 1 && (
              <>
                <SectionHeader title="Personal Details" icon="account-details" />
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Date of Birth *</Text>
                    <TouchableOpacity onPress={() => setShowDobPicker(true)}>
                      <View style={styles.selectBox}>
                        <Text style={styles.selectText}>
                          {formData.dob.toLocaleDateString()}
                        </Text>
                        <MaterialCommunityIcons
                          name="calendar"
                          size={20}
                          color="#5E72EB"
                        />
                      </View>
                    </TouchableOpacity>
                    {showDobPicker && (
                      <DateTimePicker
                        value={formData.dob}
                        mode="date"
                        display="default"
                        maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 2))}
                        onChange={(event, date) => {
                          setShowDobPicker(Platform.OS === "ios");
                          if (date) handleInputChange("dob", date);
                        }}
                      />
                    )}
                    {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
                  </View>

                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Gender *</Text>
                    <Menu
                      visible={genderMenuVisible}
                      onDismiss={() => setGenderMenuVisible(false)}
                      anchor={
                        <TouchableOpacity
                          style={styles.selectBox}
                          onPress={() => setGenderMenuVisible(true)}
                        >
                          <Text style={styles.selectText}>
                            {formData.gender || "Select"}
                          </Text>
                          <MaterialCommunityIcons
                            name="chevron-down"
                            size={20}
                            color="#666"
                          />
                        </TouchableOpacity>
                      }
                    >
                      {["Male", "Female", "Other"].map((gender) => (
                        <Menu.Item
                          key={gender}
                          onPress={() => {
                            handleInputChange("gender", gender);
                            setGenderMenuVisible(false);
                          }}
                          title={gender}
                        />
                      ))}
                    </Menu>
                    {errors.gender && (
                      <Text style={styles.errorText}>{errors.gender}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Religion *</Text>
                    <Menu
                      visible={religionMenuVisible}
                      onDismiss={() => setReligionMenuVisible(false)}
                      anchor={
                        <TouchableOpacity
                          style={styles.selectBox}
                          onPress={() => setReligionMenuVisible(true)}
                        >
                          <Text style={styles.selectText}>
                            {formData.religion || "Select"}
                          </Text>
                          <MaterialCommunityIcons
                            name="chevron-down"
                            size={20}
                            color="#666"
                          />
                        </TouchableOpacity>
                      }
                    >
                      {religions.map((religion, index) => (
                        <Menu.Item
                          key={`${religion}-${index}`}
                          onPress={() => {
                            handleInputChange("religion", religion);
                            setReligionMenuVisible(false);
                          }}
                          title={religion}
                        />
                      ))}
                    </Menu>
                  </View>

                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Caste Category *</Text>
                    <Menu
                      visible={casteMenuVisible}
                      onDismiss={() => setCasteMenuVisible(false)}
                      anchor={
                        <TouchableOpacity
                          style={styles.selectBox}
                          onPress={() => setCasteMenuVisible(true)}
                        >
                          <Text style={styles.selectText}>
                            {formData.caste || "Select"}
                          </Text>
                          <MaterialCommunityIcons
                            name="chevron-down"
                            size={20}
                            color="#666"
                          />
                        </TouchableOpacity>
                      }
                    >
                      {casteCategories.map((caste, index) => (
                        <Menu.Item
                          key={`${caste}-${index}`}
                          onPress={() => {
                            handleInputChange("caste", caste);
                            setCasteMenuVisible(false);
                          }}
                          title={caste}
                        />
                      ))}
                    </Menu>
                  </View>
                </View>

                <View style={styles.row}>
                  <TextInput
                    label="Birth Place *"
                    value={formData.birthPlace}
                    onChangeText={(text) => handleInputChange("birthPlace", text)}
                    style={[styles.input, styles.flex1]}
                    textColor="#1a1a1a"
                    mode="outlined"
                    dense
                  />
                  <View style={styles.inputGap} />
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Nationality *</Text>
                    <Menu
                      visible={nationalityMenuVisible}
                      onDismiss={() => setNationalityMenuVisible(false)}
                      anchor={
                        <TouchableOpacity
                          style={styles.selectBox}
                          onPress={() => setNationalityMenuVisible(true)}
                        >
                          <Text style={styles.selectText}>
                            {formData.nationality || "Select"}
                          </Text>
                          <MaterialCommunityIcons
                            name="chevron-down"
                            size={20}
                            color="#666"
                          />
                        </TouchableOpacity>
                      }
                    >
                      {nationalities.map((item, index) => (
                        <Menu.Item
                          key={`${item}-${index}`}
                          onPress={() => {
                            handleInputChange("nationality", item);
                            setNationalityMenuVisible(false);
                          }}
                          title={item}
                        />
                      ))}
                    </Menu>
                    {errors.nationality && (
                      <Text style={styles.errorText}>{errors.nationality}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Mother Tongue *</Text>
                    <Menu
                      visible={motherTongueMenuVisible}
                      onDismiss={() => setMotherTongueMenuVisible(false)}
                      anchor={
                        <TouchableOpacity
                          style={styles.selectBox}
                          onPress={() => setMotherTongueMenuVisible(true)}
                        >
                          <Text style={styles.selectText}>
                            {formData.motherTongue || "Select"}
                          </Text>
                          <MaterialCommunityIcons
                            name="chevron-down"
                            size={20}
                            color="#666"
                          />
                        </TouchableOpacity>
                      }
                    >
                      {motherTongues.map((item, index) => (
                        <Menu.Item
                          key={`${item}-${index}`}
                          onPress={() => {
                            handleInputChange("motherTongue", item);
                            setMotherTongueMenuVisible(false);
                          }}
                          title={item}
                        />
                      ))}
                    </Menu>
                    {errors.motherTongue && (
                      <Text style={styles.errorText}>{errors.motherTongue}</Text>
                    )}
                  </View>

                  <View style={styles.inputGap} />

                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>State *</Text>
                    <Menu
                      visible={stateMenuVisible}
                      onDismiss={() => setStateMenuVisible(false)}
                      anchor={
                        <TouchableOpacity
                          style={styles.selectBox}
                          onPress={() => setStateMenuVisible(true)}
                        >
                          <Text style={styles.selectText}>
                            {formData.state || "Select"}
                          </Text>
                          <MaterialCommunityIcons
                            name="chevron-down"
                            size={20}
                            color="#666"
                          />
                        </TouchableOpacity>
                      }
                    >
                      {states.map((item, index) => (
                        <Menu.Item
                          key={`${item}-${index}`}
                          onPress={() => {
                            handleInputChange("state", item);
                            setStateMenuVisible(false);
                          }}
                          title={item}
                        />
                      ))}
                    </Menu>
                    {errors.state && (
                      <Text style={styles.errorText}>{errors.state}</Text>
                    )}
                  </View>
                </View>
              </>
            )}

            {/* STEP 3: Family & Contact */}
            {currentStep === 2 && (
              <>
                <SectionHeader title="Parents Information" icon="human-male-female-child" />

                <TextInput
                  label="Father's Name *"
                  value={formData.fatherName}
                  onChangeText={(text) => handleInputChange("fatherName", text)}
                  style={styles.input}
                  textColor="#1a1a1a"
                  mode="outlined"
                  dense
                />
                {errors.fatherName && (
                  <Text style={styles.errorText}>{errors.fatherName}</Text>
                )}

                <TextInput
                  label="Father's Occupation *"
                  value={formData.fatherOccupation}
                  onChangeText={(text) => handleInputChange("fatherOccupation", text)}
                  style={styles.input}
                  textColor="#1a1a1a"
                  mode="outlined"
                  dense
                />

                <Divider style={{ marginVertical: 10 }} />

                <TextInput
                  label="Mother's Name *"
                  value={formData.motherName}
                  onChangeText={(text) => handleInputChange("motherName", text)}
                  style={styles.input}
                  textColor="#1a1a1a"
                  mode="outlined"
                  dense
                />
                {errors.motherName && (
                  <Text style={styles.errorText}>{errors.motherName}</Text>
                )}

                <TextInput
                  label="Mother's Occupation *"
                  value={formData.motherOccupation}
                  onChangeText={(text) => handleInputChange("motherOccupation", text)}
                  style={styles.input}
                  textColor="#1a1a1a"
                  mode="outlined"
                  dense
                />

                <SectionHeader title="Contact Details" icon="phone" />

                <View style={styles.row}>
                  <TextInput
                    label="Mobile No. 1 *"
                    keyboardType="phone-pad"
                    value={formData.parentMobile1}
                    onChangeText={(text) => handleInputChange("parentMobile1", text)}
                    onBlur={() => validateMobileNumber(formData.parentMobile1)}
                    error={!!errors.parentMobile1}
                    style={[styles.input, styles.flex1]}
                    textColor="#1a1a1a"
                    mode="outlined"
                    dense
                    maxLength={10}
                  />
                  <View style={styles.inputGap} />
                  <TextInput
                    label="Mobile No. 2"
                    keyboardType="phone-pad"
                    value={formData.parentMobile2}
                    onChangeText={(text) => handleInputChange("parentMobile2", text)}
                    style={[styles.input, styles.flex1]}
                    textColor="#1a1a1a"
                    mode="outlined"
                    dense
                    maxLength={10}
                  />
                </View>
                {errors.parentMobile1 && (
                  <Text style={styles.errorText}>{errors.parentMobile1}</Text>
                )}

                <TextInput
                  label="Residential Address *"
                  value={formData.residentialAddress}
                  onChangeText={(text) => handleInputChange("residentialAddress", text)}
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  textColor="#1a1a1a"
                  mode="outlined"
                  dense
                />
                {errors.residentialAddress && (
                  <Text style={styles.errorText}>{errors.residentialAddress}</Text>
                )}
              </>
            )}

            {/* STEP 4: Documents & Kit */}
            {currentStep === 3 && (
              <>
                <SectionHeader title="Documents" icon="file-document-multiple" />

                <TextInput
                  label="Parent Aadhar No. *"
                  keyboardType="numeric"
                  value={formData.aadharNo}
                  onChangeText={(text) => handleInputChange("aadharNo", text)}
                  style={styles.input}
                  textColor="#1a1a1a"
                  mode="outlined"
                  dense
                  maxLength={12}
                />

                <View style={styles.uploadSection}>
                  <TouchableOpacity
                    style={[
                      styles.uploadCard,
                      formData.birthCertificateUri && styles.uploadCardSuccess,
                    ]}
                    onPress={() => pickImage("birthCertificateUri")}
                  >
                    <MaterialCommunityIcons
                      name={
                        formData.birthCertificateUri
                          ? "check-circle"
                          : "file-document-outline"
                      }
                      size={28}
                      color={formData.birthCertificateUri ? "#26A69A" : "#5E72EB"}
                    />
                    <Text style={styles.uploadCardText}>Student Birth Certificate</Text>
                    {formData.birthCertificateUri && (
                      <Chip mode="flat" style={styles.uploadChip} textStyle={styles.chipText}>Uploaded</Chip>
                    )}
                    {formData.birthCertificateUri && (
                      <TouchableOpacity
                        style={styles.previewButton}
                        onPress={() => {
                          setPreviewImage(formData.birthCertificateUri);
                          setShowPreview(true);
                        }}
                      >
                        <MaterialCommunityIcons name="eye" size={16} color="#5E72EB" />
                        <Text style={styles.previewText}>View</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.uploadCard,
                      formData.aadharCardCopyUri && styles.uploadCardSuccess,
                    ]}
                    onPress={() => pickImage("aadharCardCopyUri")}
                  >
                    <MaterialCommunityIcons
                      name={
                        formData.aadharCardCopyUri
                          ? "check-circle"
                          : "card-account-details-outline"
                      }
                      size={28}
                      color={formData.aadharCardCopyUri ? "#26A69A" : "#5E72EB"}
                    />
                    <Text style={styles.uploadCardText}>Student Aadhar Card</Text>
                    {formData.aadharCardCopyUri && (
                      <Chip mode="flat" style={styles.uploadChip} textStyle={styles.chipText}>Uploaded</Chip>
                    )}
                    {formData.aadharCardCopyUri && (
                      <TouchableOpacity
                        style={styles.previewButton}
                        onPress={() => {
                          setPreviewImage(formData.aadharCardCopyUri);
                          setShowPreview(true);
                        }}
                      >
                        <MaterialCommunityIcons name="eye" size={16} color="#5E72EB" />
                        <Text style={styles.previewText}>View</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                </View>

                <SectionHeader title="School Kit" icon="bag-personal" />
                <View style={styles.kitGrid}>
                  {kitAccessories.map((item, index) => (
                    <TouchableOpacity
                      key={`${item}-${index}`}
                      style={[
                        styles.kitItem,
                        formData.kitItems.includes(item) && styles.kitItemSelected,
                      ]}
                      onPress={() => handleCheckboxChange(item)}
                    >
                      <Checkbox
                        status={formData.kitItems.includes(item) ? "checked" : "unchecked"}
                        color="#5E72EB"
                      />
                      <Text style={styles.kitItemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <SectionHeader title="Fee Details" icon="cash-multiple" />
                <TextInput
                  label="Total Fees (₹) *"
                  value={formData.totalFees}
                  style={[styles.input, { backgroundColor: '#f0f0f0' }]}
                  mode="outlined"
                  textColor="#1a1a1a"
                  dense
                  editable={false}
                  left={<TextInput.Icon icon="currency-inr" />}
                />
                <TextInput
                  label="Discount (₹)"
                  keyboardType="numeric"
                  value={formData.discount}
                  onChangeText={(text) => handleInputChange("discount", text)}
                  style={styles.input}
                  textColor="#1a1a1a"
                  mode="outlined"
                  dense
                  left={<TextInput.Icon icon="currency-inr" />}
                />
              </>
            )}

          </Card.Content>
        </Card>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {currentStep > 0 && (
          <Button
            mode="outlined"
            onPress={handleBack}
            style={styles.navButton}
            textColor="#5E72EB"
            contentStyle={{ height: 50 }}
          >
            Back
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleNext}
          disabled={isSubmitting && currentStep === totalSteps - 1}
          style={[styles.navButton, { flex: 1, marginLeft: currentStep > 0 ? 12 : 0 }]}
          buttonColor="#5E72EB"
          icon={currentStep === totalSteps - 1 ? "check-circle" : "arrow-right"}
          contentStyle={{ flexDirection: 'row-reverse', height: 50 }}
          labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }}
        >
          {currentStep === totalSteps - 1 ? (isSubmitting ? "Submitting..." : (isEditMode ? "Update Submission" : "Submit Admission")) : "Next Step"}
        </Button>
      </View>

      {/* Document Preview Modal */}
      <Modal
        visible={showPreview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPreview(false)}
            >
              <MaterialCommunityIcons name="close" size={20} color="white" />
            </TouchableOpacity>
            {previewImage && (
              <Image
                key={previewImage}
                source={{ uri: previewImage }}
                style={styles.previewImage}
                resizeMode="contain"
                onError={(e) => console.log("Preview load error:", e.nativeEvent.error)}
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },
  header: {
    height: 0,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginVertical: 10, // Compacted
  },
  progressBarBackground: {
    height: 6, // Compacted
    backgroundColor: '#E5E9F2',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#5E72EB',
    borderRadius: 3,
  },
  stepTitle: {
    marginTop: 6, // Compacted
    fontSize: 11, // Compacted
    color: '#5E72EB',
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  scrollContent: {
    paddingBottom: 100, // Compacted
    paddingHorizontal: 8, // Compacted
  },
  card: {
    marginHorizontal: 12, // Compacted
    marginBottom: 12, // Compacted
    borderRadius: 16, // Compacted
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  infoCard: {
    padding: 12, // Compacted
    borderRadius: 12, // Compacted
    backgroundColor: "#fff",
    marginBottom: 12, // Compacted
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12, // Compacted
    marginTop: 6, // Compacted
    paddingHorizontal: 4,
  },
  sectionIconBox: {
    width: 32, // Compacted
    height: 32, // Compacted
    borderRadius: 10,
    backgroundColor: "#EFF2FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10, // Compacted
  },
  sectionTitle: {
    fontSize: 15, // Compacted
    fontWeight: "700",
    color: "#2D3748",
    flex: 1,
  },
  label: {
    fontSize: 12, // Compacted
    color: "#64748B",
    marginBottom: 4, // Compacted
    fontWeight: "600",
    marginLeft: 2,
  },
  input: {
    marginBottom: 10, // Compacted
    backgroundColor: "#fff",
    fontSize: 13, // Compacted
    height: 40, // Compacted
  },
  inputText: {
    color: "#1a1a1a",
  },
  row: {
    flexDirection: "row",
    gap: 8, // Compacted
    marginBottom: 6, // Compacted
  },
  halfWidth: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  inputGap: {
    width: 8, // Compacted
  },
  selectBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1, // Thinner border
    borderColor: "#E2E8F0",
    borderRadius: 8, // Compacted
    paddingHorizontal: 10, // Compacted
    paddingVertical: 10, // Compacted
    backgroundColor: "#fff",
    marginBottom: 10, // Compacted
    height: 40, // Fixed height for alignment
  },
  selectText: {
    fontSize: 13, // Compacted
    color: "#2D3748",
  },

  // Photo Upload
  photoBox: {
    alignSelf: "center",
    width: 90, // Compacted
    height: 110, // Compacted
    borderRadius: 12, // Compacted
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16, // Compacted
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    overflow: 'hidden',
  },
  photoImage: {
    width: 86, // Compacted
    height: 106, // Compacted
    borderRadius: 10,
  },
  photoPlaceholder: {
    alignItems: "center",
    gap: 4,
  },
  photoText: {
    fontSize: 10, // Compacted
    color: "#94A3B8",
    fontWeight: '500',
    textAlign: 'center',
  },

  // Document Uploads
  uploadSection: {
    flexDirection: "row",
    gap: 8, // Compacted
    marginBottom: 12, // Compacted
  },
  uploadCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12, // Compacted
    padding: 12, // Compacted
    alignItems: "center",
    gap: 6, // Compacted
    borderStyle: "dashed",
  },
  uploadCardSuccess: {
    backgroundColor: "#F0FDFA",
    borderColor: "#26A69A",
    borderStyle: "solid",
  },
  uploadCardText: {
    fontSize: 11, // Compacted
    color: "#475569",
    textAlign: "center",
    fontWeight: "600",
  },
  uploadChip: {
    backgroundColor: "#26A69A",
    height: 20, // Compacted
  },
  chipText: {
    fontSize: 9, // Compacted
    color: "#fff",
    fontWeight: '700',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    gap: 2,
  },
  previewText: {
    fontSize: 10, // Compacted
    color: '#5E72EB',
    fontWeight: '600',
  },

  // Kit Items
  kitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, // Compacted
    marginBottom: 12, // Compacted
  },
  kitItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8, // Compacted
    paddingRight: 8, // Compacted
    width: "48%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 2, // Compacted
  },
  kitItemSelected: {
    backgroundColor: "#EFF2FE",
    borderColor: "#5E72EB",
  },
  kitItemText: {
    fontSize: 12, // Compacted
    color: "#2D3748",
    flex: 1,
    fontWeight: '500',
  },

  // Errors
  errorText: {
    color: "#EF4444",
    fontSize: 11, // Compacted
    marginTop: -8, // Compacted
    marginBottom: 10, // Compacted
    marginLeft: 2,
    fontWeight: '500',
  },

  // Footer / Buttons
  footer: {
    position: 'absolute',
    bottom: 16, // Compacted
    left: 16,
    right: 16,
    flexDirection: 'row',
    padding: 12, // Compacted
    backgroundColor: '#fff',
    borderRadius: 16, // Compacted
    elevation: 8,
    shadowColor: '#1A202C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: 'center',
    gap: 8, // Compacted
  },
  navButton: {
    borderRadius: 10, // Compacted
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '60%', // Compacted
    backgroundColor: 'white',
    borderRadius: 16,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: -40,
    right: 0,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
});

export default StudentAdmissionForm;
