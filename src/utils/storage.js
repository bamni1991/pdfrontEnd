import AsyncStorage from "@react-native-async-storage/async-storage";

// Store user session with ID
export const storeSession = async (userData, userId) => {
  try {
    await AsyncStorage.setItem("userData", JSON.stringify(userData));
    await AsyncStorage.setItem("userId", userId.toString());
    await AsyncStorage.setItem("role_name", userData.role_name);
    await AsyncStorage.setItem("isLoggedIn", "true");
  } catch (error) {
    // Error storing session
  }
};

// Retrieve user ID
export const getUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    return userId ? parseInt(userId) : null;
  } catch (error) {
    // Error getting user ID
    return null;
  }
};

// Get complete session
export const getSession = async () => {
  try {
    const [userData, userId, role_name, isLoggedIn] = await Promise.all([
      AsyncStorage.getItem("userData"),
      AsyncStorage.getItem("userId"),
      AsyncStorage.getItem("role_name"),
      AsyncStorage.getItem("isLoggedIn"),
    ]);

    return {
      userData: userData ? JSON.parse(userData) : null,
      userId: userId ? parseInt(userId) : null,
      role_name: role_name ? role_name : null,
      isLoggedIn: isLoggedIn === "true",
    };
  } catch (error) {
    // Error retrieving session
    return null;
  }
};

// Clear session
export const clearSession = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem("userData"),
      AsyncStorage.removeItem("userId"),
      AsyncStorage.removeItem("role_name"),
      AsyncStorage.removeItem("userImage"),
      AsyncStorage.removeItem("isLoggedIn"),
    ]);
  } catch (error) {
    console.log("Error clearing session:", error);
  }
};

// Store push token
export const storePushToken = async (token) => {
  try {
    await AsyncStorage.setItem("pushToken", token);
  } catch (error) {
    console.error("Error storing push token:", error);
  }
};

// Retrieve push token
export const getPushToken = async () => {
  try {
    return await AsyncStorage.getItem("pushToken");
  } catch (error) {
    console.error("Error retrieving push token:", error);
    return null;
  }
};
