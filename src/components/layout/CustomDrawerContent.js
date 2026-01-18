import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { Text, useTheme, Avatar, Modal, Portal } from "react-native-paper";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import axios from "axios";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";

import SideFooter from "./SideFooter";
import { useAuth } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

// ============================================================================
// CONSTANTS & CONFIG
// ============================================================================

const SCHOOL_MENU_STRUCTURE = {
  admin: {
    management: {
      title: "Management",
      icon: "⚙️",
      items: [
        {
          key: "teachers",
          label: "Teachers",
          icon: "👩‍🏫",
          screen: "ManageTeachers",
          color: "#3498db",
        },
        {
          key: "parents",
          label: "Parents",
          icon: "👨‍👩‍👧",
          screen: "ManageParents",
          color: "#2ecc71",
        },
        {
          key: "students",
          label: "Students",
          icon: "🎓",
          screen: "ManageStudents",
          color: "#9b59b6",
        },
      ],
    },
    communication: {
      title: "Communication",
      icon: "📢",
      items: [
        {
          key: "announcements",
          label: "Announcements",
          icon: "🗣️",
          screen: "Announcements",
          color: "#f1c40f",
        },
        {
          key: "events",
          label: "Events",
          icon: "🎉",
          screen: "Events",
          color: "#e67e22",
        },
      ],
    },
    academics: {
      title: "Academics",
      icon: "📚",
      items: [
        {
          key: "attendance",
          label: "Attendance",
          icon: "📝",
          screen: "AttendanceRecords",
          color: "#1abc9c",
        },
        {
          key: "reports",
          label: "Reports",
          icon: "📊",
          screen: "GenerateReports",
          color: "#e74c3c",
        },
      ],
    },
  },
  teacher: {
    academics: {
      title: "Academics",
      icon: "📚",
      items: [
        {
          key: "myClasses",
          label: "My Classes",
          icon: "🏫",
          screen: "MyClasses",
          color: "#3498db",
        },
        {
          key: "myStudents",
          label: "My Students",
          icon: "🎓",
          screen: "MyStudents",
          color: "#9b59b6",
        },
        {
          key: "attendance",
          label: "Attendance",
          icon: "📝",
          screen: "TakeAttendance",
          color: "#1abc9c",
        },
        {
          key: "assignments",
          label: "Assignments",
          icon: "✍️",
          screen: "Assignments",
          color: "#f39c12",
        },
        {
          key: "grades",
          label: "Grades",
          icon: "💯",
          screen: "EnterGrades",
          color: "#e74c3c",
        },
      ],
    },
    communication: {
      title: "Communication",
      icon: "📢",
      items: [
        {
          key: "announcements",
          label: "Announcements",
          icon: "🗣️",
          screen: "ViewAnnouncements",
          color: "#f1c40f",
        },
        {
          key: "leave",
          label: "Leave Requests",
          icon: "✈️",
          screen: "LeaveRequests",
          color: "#34495e",
        },
      ],
    },
  },
  parent: {
    childInfo: {
      title: "My Child",
      icon: "🧒",
      items: [
        {
          key: "profile",
          label: "Profile",
          icon: "👤",
          screen: "ChildProfile",
          color: "#3498db",
        },
        {
          key: "attendance",
          label: "Attendance",
          icon: "📝",
          screen: "ChildAttendance",
          color: "#1abc9c",
        },
        {
          key: "homework",
          label: "Homework",
          icon: "✍️",
          screen: "ChildHomework",
          color: "#f39c12",
        },
        {
          key: "grades",
          label: "Report Card",
          icon: "💯",
          screen: "ChildGrades",
          color: "#e74c3c",
        },
      ],
    },
    school: {
      title: "School",
      icon: "🏫",
      items: [
        {
          key: "fees",
          label: "Fee Payment",
          icon: "💳",
          screen: "FeePayment",
          color: "#9b59b6",
        },
        {
          key: "announcements",
          label: "Announcements",
          icon: "🗣️",
          screen: "ViewAnnouncements",
          color: "#f1c40f",
        },
        {
          key: "communication",
          label: "Contact Teacher",
          icon: "💬",
          screen: "ContactTeacher",
          color: "#2ecc71",
        },
      ],
    },
  },
};

const ANIMATION_CONFIG = {
  DURATION: 200,
  EASING: Easing.ease,
};

const COLORS = {
  PRIMARY: "#6366f1",
  SECONDARY: "#8b5cf6",
  DANGER: "#ef4444",
  TEXT_DARK: "#374151",
  TEXT_LIGHT: "#FFFFFF",
  WHITE: "#FFFFFF",
};

// ============================================================================
// COMPONENT
// ============================================================================

const CustomDrawerContent = (props) => {
  const { backendUrl, userImageBaseUrl } = useConfigConstants();
  const { role_name, userId, user, userImage, logout, updateUser } = useAuth();

  // State Management
  const [activeKey, setActiveKey] = useState("home");
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const menuStructure = useMemo(() => {
    const role = role_name || "parent"; // Default to 'parent' if role is not defined
    return SCHOOL_MENU_STRUCTURE[role] || {};
  }, [role_name]);

  const [expandedSections, setExpandedSections] = useState(
    getInitialExpandedState(menuStructure)
  );

  // Animations
  // Animations
  const sectionAnimations = useMemo(() => {
    const initialExpanded = getInitialExpandedState(menuStructure);
    return initializeSectionAnimations(menuStructure, initialExpanded);
  }, [menuStructure]);

  // Sync expandedSections when menuStructure changes
  useEffect(() => {
    setExpandedSections(getInitialExpandedState(menuStructure));
  }, [menuStructure]);
  const itemScale = useRef(new Animated.Value(1)).current;

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleToggleSection = (sectionName) => {
    const newExpandedState = buildExpandedState(sectionName);
    animateSections(newExpandedState);
    setExpandedSections(newExpandedState);
  };

  const handleMenuItemPress = (screenName, itemKey, sectionName) => {
    animateItemPress(itemScale);
    setActiveKey(itemKey);
    if (screenName === "Home") {
      if (role_name === "admin") {
        props.navigation.navigate("AdminNavigator", {
          screen: "AdminDashboard",
        });
      } else if (role_name === "teacher") {
        props.navigation.navigate("TeacherNavigator", {
          // Assuming you have a TeacherNavigator
          screen: "TeacherDashboard",
        });
      } else if (role_name === "parent") {
        props.navigation.navigate("ParentNavigator", {
          // Assuming you have a ParentNavigator
          screen: "ParentDashboard",
        });
      }
      props.navigation.closeDrawer();
      collapseAllSections();
      // props.navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } else {
      if (sectionName) expandSpecificSection(sectionName);
      navigateToScreen(screenName);
    }
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage({
        uri: result.assets[0].uri,
        type: "image/jpeg",
        name: `profile_${Date.now()}.jpg`,
      });
    }
  };

  const handleUploadProfileImage = async () => {
    if (!selectedImage) return;

    setUploading(true);
    try {
      const compressedImage = await compressImage(selectedImage.uri);
      if (!compressedImage) {
        setUploading(false);
        return;
      }

      const base64data = await convertImageToBase64(compressedImage.uri);
      const uploadResponse = await uploadImageToServer(base64data);
      if (uploadResponse?.data?.status) {
        showSuccessToast("Profile Image Uploaded successfully");

        // user.profile_image = uploadResponse.data?.data?.fileName;
        updateUser({ profile_image: uploadResponse.data?.data?.fileName });
        setImageModalVisible(false);
        setSelectedImage(null);
      } else {
        throw new Error(uploadResponse.data.message || "Upload failed");
      }
    } catch (error) {
      showErrorToast("Upload failed", error.message);
      console.error("Image upload failed:", error.message);
    } finally {
      setUploading(false);
    }
  };

  // ========================================================================
  // ANIMATION HELPERS
  // ========================================================================

  function initializeSectionAnimations(menu, expanded) {
    return Object.keys(menu).reduce((acc, sectionName) => {
      acc[sectionName] = new Animated.Value(
        expandedSections[sectionName] ? 1 : 0
      );
      return acc;
    }, {});
  }

  function animateSections(newState) {
    Object.entries(newState).forEach(([name, isExpanded]) => {
      Animated.timing(sectionAnimations[name], {
        toValue: isExpanded ? 1 : 0,
        duration: ANIMATION_CONFIG.DURATION,
        easing: ANIMATION_CONFIG.EASING,
        useNativeDriver: false,
      }).start();
    });
  }

  function animateItemPress(scale) {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }

  // ========================================================================
  // STATE BUILDERS
  // ========================================================================

  function buildExpandedState(activeSection) {
    const newState = {};
    Object.keys(menuStructure).forEach((name) => {
      newState[name] = name === activeSection ? !expandedSections[name] : false;
    });
    return newState;
  }

  function collapseAllSections() {
    const collapsedState = Object.keys(menuStructure).reduce((acc, name) => {
      acc[name] = false;
      return acc;
    }, {});
    animateSections(collapsedState);
    setExpandedSections(collapsedState);
  }

  function expandSpecificSection(sectionName) {
    const newState = Object.keys(menuStructure).reduce((acc, name) => {
      acc[name] = name === sectionName;
      return acc;
    }, {});
    animateSections(newState);
    setExpandedSections(newState);
  }

  // ========================================================================
  // IMAGE HANDLERS
  // ========================================================================

  async function compressImage(uri) {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result;
    } catch (error) {
      showErrorToast("Error", "Failed to process image.");
      console.error("Error compressing image:", error);
      return null;
    }
  }

  async function convertImageToBase64(uri) {
    const response = await fetch(uri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function uploadImageToServer(base64data) {
    // console.log(base64data);
    return axios.post(`${backendUrl}upload-profile-image`, {
      profile_image: base64data,
      user_id: userId,
      image_type: "jpeg",
    });
  }

  // ========================================================================
  // NAVIGATION
  // ========================================================================

  function navigateToScreen(screenName) {
    console.log(screenName);
    if (screenName === "Task Management") {
      props.navigation.navigate("Task Management", {
        screen: "AssignedTasks",
      });
    } else if (screenName === "MOM") {
      // This will now be correctly triggered
      props.navigation.navigate("MOM", { screen: "MOMScreen" });
    } else {
      props.navigation.navigate(screenName);
    }
  }

  // ========================================================================
  // TOAST NOTIFICATIONS
  // ========================================================================

  function showSuccessToast(message) {
    Toast.show({
      type: "success",
      text1: "✅ Success",
      text2: message,
    });
  }

  function showErrorToast(title, message) {
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
    });
  }

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  function renderUserProfile() {
    console.log(`${userImageBaseUrl}${user?.profile_image}`);
    return (
      <View style={styles.profileSection}>
        <LinearGradient
          colors={[COLORS.PRIMARY, COLORS.SECONDARY]}
          style={styles.profileCard}
        >
          <View style={styles.profileContent}>
            <TouchableOpacity
              onPress={() => setImageModalVisible(true)}
              activeOpacity={0.8}
            >
              {user?.profile_image ? (
                <Avatar.Image
                  source={{
                    uri: `${userImageBaseUrl}${user?.profile_image}`,
                  }}
                  size={60}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.iconText}>📷</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.name || "Guest"}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || "No email"}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  function renderDashboardButton() {
    const isActive = activeKey === "dashboard";
    return (
      <TouchableOpacity
        style={[
          styles.dashboardButton,
          isActive && styles.dashboardButtonActive,
        ]}
        onPress={() => handleMenuItemPress("Home", "dashboard")}
        activeOpacity={0.7}
      >
        <View style={styles.dashboardContent}>
          <View
            style={[
              styles.dashboardIcon,
              isActive && styles.dashboardIconActive,
            ]}
          >
            <Text
              style={[
                styles.iconText,
                { color: isActive ? COLORS.WHITE : COLORS.PRIMARY },
              ]}
            >
              🏠
            </Text>
          </View>
          <Text
            style={[
              styles.dashboardText,
              isActive && styles.dashboardTextActive,
            ]}
          >
            Dashboard
          </Text>
          <Text
            style={[
              styles.iconText,
              {
                color: isActive ? "rgba(255,255,255,0.7)" : "#a5b4fc",
                fontSize: 20,
              },
            ]}
          >
            ›
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  function renderMenuSections() {
    return Object.entries(menuStructure).map(([sectionName, section]) => (
      <View key={sectionName} style={styles.menuSection}>
        {renderSectionHeader(sectionName, section)}
        {renderSectionItems(sectionName, section)}
      </View>
    ));
  }

  function renderSectionHeader(sectionName, section) {
    return (
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => handleToggleSection(sectionName)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderContent}>
          <Text style={[styles.iconText, { color: COLORS.PRIMARY }]}>
            {section.icon}
          </Text>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: sectionAnimations[sectionName].interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            }}
          >
            <Text style={[styles.iconText, { color: COLORS.TEXT_DARK }]}>
              ⌄
            </Text>
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  }

  function renderSectionItems(sectionName, section) {
    return (
      <Animated.View
        style={{
          height: sectionAnimations[sectionName].interpolate({
            inputRange: [0, 1],
            outputRange: [0, section.items.length * 50],
          }),
          opacity: sectionAnimations[sectionName],
          overflow: "hidden",
        }}
      >
        <View style={styles.menuItems}>
          {section.items.map((item) => renderMenuItem(item, sectionName))}
        </View>
      </Animated.View>
    );
  }

  function renderMenuItem(item, sectionName) {
    const isActive = activeKey === item.key;
    return (
      <TouchableOpacity
        key={item.key}
        style={[styles.menuItem, isActive && styles.menuItemActive]}
        onPress={() => handleMenuItemPress(item.screen, item.key, sectionName)}
        activeOpacity={0.7}
      >
        <View style={styles.menuIcon}>
          <Text
            style={[
              styles.iconText,
              {
                color: isActive ? COLORS.WHITE : item.color,
                fontSize: 14,
              },
            ]}
          >
            {item.icon}
          </Text>
        </View>
        <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
          {item.label}
        </Text>
        <Text
          style={[
            styles.iconText,
            {
              color: isActive ? "rgba(255,255,255,0.7)" : "#a0aec0",
              fontSize: 20,
            },
          ]}
        >
          ›
        </Text>
      </TouchableOpacity>
    );
  }

  function renderLogoutButton() {
    return (
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        activeOpacity={0.7}
      >
        <Text style={[styles.iconText, { color: COLORS.DANGER, fontSize: 16 }]}>
          🚪
        </Text>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    );
  }

  function renderImageModal() {
    return (
      <Portal>
        <Modal
          visible={imageModalVisible}
          onDismiss={() => setImageModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <LinearGradient
            colors={[COLORS.PRIMARY, COLORS.SECONDARY]}
            style={{ borderRadius: 16 }}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Profile Image</Text>

              {selectedImage && (
                <Avatar.Image
                  source={{ uri: selectedImage.uri }}
                  size={80}
                  style={styles.previewImage}
                />
              )}

              <TouchableOpacity
                style={styles.pickImageButton}
                onPress={handleImagePick}
              >
                <LinearGradient
                  colors={[COLORS.PRIMARY, COLORS.SECONDARY]}
                  style={styles.pickImageGradient}
                >
                  <Text style={[styles.iconText, { color: COLORS.WHITE }]}>
                    📷
                  </Text>
                  <Text style={styles.pickImageText}>
                    {selectedImage ? "Change" : "Choose"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setImageModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!selectedImage || uploading) && styles.saveButtonDisabled,
                  ]}
                  onPress={handleUploadProfileImage}
                  disabled={!selectedImage || uploading}
                >
                  <Text style={styles.saveText}>
                    {uploading ? "Uploading..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Modal>
      </Portal>
    );
  }

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <LinearGradient
      colors={["#ffffff", "#f8fafc", "#e2e8f0"]}
      style={styles.container}
    >
      <DrawerContentScrollView
        {...props}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {renderUserProfile()}
        {renderDashboardButton()}
        {renderMenuSections()}
        {renderLogoutButton()}
      </DrawerContentScrollView>

      <SideFooter />
      {renderImageModal()}
    </LinearGradient>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function useConfigConstants() {
  const { backendUrl, userImageBaseUrl } = useMemo(() => {
    const config = Constants.expoConfig?.extra || {};
    return {
      backendUrl: config.backendUrl || "",
      userImageBaseUrl: config.userImageBaseUrl || "",
    };
  }, []);

  return { backendUrl, userImageBaseUrl };
}

function getInitialExpandedState(menu) {
  const state = {};
  Object.keys(menu).forEach((sectionName, index) => {
    state[sectionName] = true; // Expand all sections by default
  });
  return state;
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 10, paddingBottom: 30 },

  // Profile Section
  profileSection: { margin: 12 },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
  },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.WHITE,
    marginBottom: 2,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.WHITE,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },

  // Dashboard Button
  dashboardButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dashboardButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.3,
    elevation: 6,
  },
  dashboardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dashboardIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  dashboardIconActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dashboardText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.TEXT_DARK,
  },
  dashboardTextActive: {
    color: COLORS.WHITE,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Menu Sections
  menuSection: { marginHorizontal: 12, marginBottom: 16 },
  sectionHeader: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.TEXT_DARK,
    marginLeft: 8,
  },

  // Menu Items
  menuItems: { borderRadius: 10, overflow: "hidden" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    marginVertical: 2,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.6)",
    zIndex: 1,
  },
  menuItemActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  menuIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.TEXT_DARK,
  },
  menuTextActive: {
    color: COLORS.WHITE,
    fontWeight: "700",
  },

  // Logout Button
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DANGER,
    marginLeft: 6,
  },

  // Modal
  modal: {
    margin: 20,
    backgroundColor: "transparent",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalContent: { padding: 20, alignItems: "center" },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.WHITE,
    marginBottom: 16,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  previewImage: {
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  pickImageButton: { borderRadius: 10, overflow: "hidden", marginBottom: 16 },
  pickImageGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  pickImageText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.WHITE,
    marginLeft: 6,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  modalActions: { flexDirection: "row", gap: 10, width: "100%" },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.WHITE,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#007bff",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  saveText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.WHITE,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },

  // Icon
  iconText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.WHITE,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});

export default CustomDrawerContent;
